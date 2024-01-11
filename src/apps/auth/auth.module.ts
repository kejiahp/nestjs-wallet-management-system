import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { SessionModule } from '../session/session.module';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { EncryptionModule } from 'src/common/encryption/encryption.module';
import { BullModule } from '@nestjs/bull';
import { MailerModule } from 'src/common/mailer/mailer.module';
import { AuthMailingConsumer } from './queues/auth.consumer';
import { RedisModule } from 'src/common/caching/redis/redis.module';
import { JwtModule } from 'src/common/jwt/jwt.module';
import { queueKeys } from 'src/common/constant/queue-keys';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    UserModule,
    SessionModule,
    CloudinaryModule,
    EncryptionModule,
    MailerModule,
    RedisModule,
    BullModule.registerQueue({
      name: queueKeys.authMailingQueue,
    }),
    JwtModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthMailingConsumer, AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
