import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentModule } from 'src/common/payment/payment.module';
import { ProtectedWalletController } from './protected-wallet/protected-wallet.controller';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from 'src/common/jwt/jwt.module';

@Module({
  imports: [PrismaModule, PaymentModule, AuthModule, JwtModule],
  controllers: [WalletController, ProtectedWalletController],
  providers: [WalletService],
})
export class WalletModule {}
