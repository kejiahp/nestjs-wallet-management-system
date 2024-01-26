import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { PaymentService } from 'src/common/payment/payment.service';
import { ResolveAccountDetailsDto } from './dto/wallet.dto';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Utilities } from 'src/common/utils/utilities';

const otpTTL = Utilities.daysToSeconds(1);

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly paymentService: PaymentService,
  ) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(otpTTL)
  @Get('get-country')
  async getCountry() {
    return await this.paymentService.getCountry();
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(otpTTL)
  @Get('get-all-banks')
  async getBankAvailable() {
    return await this.paymentService.getBankData('nigeria');
  }

  @Post('resolve-account-details')
  async resolveAccountDetails(@Body() body: ResolveAccountDetailsDto) {
    return await this.paymentService.resolveBankAccount(
      body.account_number,
      body.bank_code,
    );
  }

  @Post('paystack-webhook')
  @HttpCode(200)
  async depositConfirmationWebHook(
    @Body() body: any,
    @Headers('x-paystack-signature') X_PAYSTACK_SIGNATURE: string,
  ) {
    return this.walletService.webhookService(body, X_PAYSTACK_SIGNATURE);
  }
}
