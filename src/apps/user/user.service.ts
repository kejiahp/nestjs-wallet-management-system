import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import ResponseHandler from 'src/common/utils/ResponseHandler';
import { LoginDto } from '../auth/dto/create-auth.dto';
import { EncryptionService } from 'src/common/encryption/encryption.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  public async createUser(payload: {
    email: string;
    password: string;
    image_url: string;
    cloudinary_public_id: string;
  }): Promise<Omit<User, 'password'> | void> {
    const emailExists = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (emailExists) {
      return ResponseHandler.error(HttpStatus.CONFLICT, 'Email already exists');
    }

    const user = await this.prisma.user.create({
      data: payload,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...props } = user;
    return props;
  }

  public async verifyUserAccount(email: string) {
    const userExist = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (!userExist) {
      return ResponseHandler.error(HttpStatus.NOT_FOUND, 'Account not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        email: email,
      },
      data: {
        account_status: 'ACTIVE',
        email_verified: true,
        email_verified_at: new Date(),
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...props } = updatedUser;

    return props;
  }

  public async verifyUserCredential(loginDto: LoginDto) {
    const userWithEmail = await this.findUserByEmailService(loginDto.email);

    if (!userWithEmail) {
      return ResponseHandler.error(
        HttpStatus.NOT_FOUND,
        "Account doesn't exist",
      );
    }

    const comparePassword = await this.encryptionService.comparePassword(
      loginDto.password,
      userWithEmail.password,
    );

    if (!comparePassword) {
      return ResponseHandler.error(
        HttpStatus.BAD_REQUEST,
        'Invalid Credentials',
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...otherProps } = userWithEmail;
    return otherProps;
  }

  public async findUserByIdService(user_id: string) {
    return await this.prisma.user.findUnique({
      where: {
        id: user_id,
      },
    });
  }

  public async findUserByEmailService(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  public async updateUserResetCode(email: string, resetCode: string) {
    return await this.prisma.user.update({
      where: { email: email },
      data: {
        password_reset_code: resetCode,
      },
    });
  }

  public async getUserByResetCode(resetCode: string) {
    return await this.prisma.user.findFirst({
      where: {
        password_reset_code: resetCode,
      },
    });
  }

  public async changePassword(email: string, hashPassword: string) {
    return await this.prisma.user.update({
      where: { email },
      data: {
        password: hashPassword,
      },
    });
  }
}
