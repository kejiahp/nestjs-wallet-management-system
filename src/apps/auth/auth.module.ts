import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { SessionModule } from '../session/session.module';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { EncryptionModule } from 'src/common/encryption/encryption.module';

@Module({
  imports: [UserModule, SessionModule, CloudinaryModule, EncryptionModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
