import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import ResponseHandler from 'src/common/utils/ResponseHandler';

@Injectable()
export class UserService {
  constructor(public readonly prisma: PrismaService) {}

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
}
