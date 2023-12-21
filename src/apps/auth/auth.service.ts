import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateAuthDto, EmailVerificationDto } from './dto/create-auth.dto';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { EncryptionService } from 'src/common/encryption/encryption.service';
import { UserService } from '../user/user.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import ResponseHandler from 'src/common/utils/ResponseHandler';
import { RedisService } from 'src/common/caching/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectQueue('auth-mailing-queue') private authMailQueue: Queue,
    private readonly cloudinaryService: CloudinaryService,
    private readonly encryptionService: EncryptionService,
    private readonly redisService: RedisService,
    private readonly userService: UserService,
  ) {}

  async create(
    createAuthDto: CreateAuthDto,
    profilePhoto: Express.Multer.File,
  ) {
    const photoUploadResult =
      await this.cloudinaryService.uploadImage(profilePhoto);

    const hashPassword = await this.encryptionService.hashPassword(
      createAuthDto.password,
    );

    const user = await this.userService.createUser({
      email: createAuthDto.email,
      password: hashPassword,
      image_url: photoUploadResult.secure_url,
      cloudinary_public_id: photoUploadResult.public_id,
    });

    await this.authMailQueue.add('send-otp', {
      user,
    });

    return user;
  }

  async verifyEmailService(emailVerificationDto: EmailVerificationDto) {
    const optCode = await this.redisService.getFromCache(
      `${emailVerificationDto.email}-otp`,
    );

    console.log(optCode);

    if (!optCode) {
      return ResponseHandler.error(HttpStatus.NOT_FOUND, 'Invalid OTP code');
    }

    if (emailVerificationDto.otp !== optCode) {
      return ResponseHandler.error(
        HttpStatus.BAD_REQUEST,
        'OTP codes do not match',
      );
    }

    const updatedUser = await this.userService.verifyUserAccount(
      emailVerificationDto.email,
    );

    await this.redisService.deleteFromCache(
      `${emailVerificationDto.email}-otp`,
    );

    await this.authMailQueue.add('email-verified', {
      user: updatedUser,
    });

    if (updatedUser) {
      return ResponseHandler.response(
        HttpStatus.OK,
        true,
        'Account successfully verified',
      );
    }

    return ResponseHandler.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Failed to verify account',
    );
  }
}
