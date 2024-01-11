import { Body, Controller, Get, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { PaymentService } from 'src/common/payment/payment.service';
import { ResolveAccountDetailsDto } from './dto/wallet.dto';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly paymentService: PaymentService,
  ) {}

  @Get('get-country')
  async getCountry() {
    return await this.paymentService.getCountry();
  }

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
}
