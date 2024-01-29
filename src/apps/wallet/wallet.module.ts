import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentModule } from 'src/common/payment/payment.module';
import { ProtectedWalletController } from './protected-wallet/protected-wallet.controller';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from 'src/common/jwt/jwt.module';
import { EncryptionModule } from 'src/common/encryption/encryption.module';
import { BullModule } from '@nestjs/bull';
import { queueKeys } from 'src/common/constant/queue-keys';
import { MailerModule } from 'src/common/mailer/mailer.module';
import { WalletConsumer } from './queues/wallet.consumer';
import { RedisModule } from 'src/common/caching/redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    PaymentModule,
    AuthModule,
    JwtModule,
    EncryptionModule,
    MailerModule,
    RedisModule,
    BullModule.registerQueue({
      name: queueKeys.walletQueue,
    }),
  ],
  controllers: [WalletController, ProtectedWalletController],
  providers: [WalletService, WalletConsumer],
})
export class WalletModule {}
