import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EncryptionModule } from 'src/common/encryption/encryption.module';

@Module({
  imports: [PrismaModule, EncryptionModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
