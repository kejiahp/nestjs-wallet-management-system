import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { EncryptionService } from 'src/common/encryption/encryption.service';
import { UserService } from '../user/user.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AuthService {
  constructor(
    @InjectQueue('auth-mailing-queue') private authMailQueue: Queue,
    private readonly cloudinaryService: CloudinaryService,
    private readonly encryptionService: EncryptionService,
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
}
