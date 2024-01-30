import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/apps/auth/guards/auth.guard';
import {
  CreateWalletDto,
  DepositMoneyDto,
  WithdrawDto,
} from '../dto/wallet.dto';
import { WalletService } from '../wallet.service';
import { AuthUserType, RequestAuthUserType } from 'src/apps/auth/types';
import { Utilities } from 'src/common/utils/utilities';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';

@Controller('protected-wallet')
@UseGuards(AuthGuard)
export class ProtectedWalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('create-wallet')
  async createWallet(
    @Body() body: CreateWalletDto,
    @Req() request: RequestAuthUserType,
  ) {
    const user_id = request.user.id;
    return await this.walletService.createWallet(body, user_id);
  }

  @Get('set-recipient-code')
  async setRecipientCode(@Req() req: RequestAuthUserType) {
    const user_id = req.user.id;
    return await this.walletService.addRecipientCode(user_id);
  }

  @Get('get-wallet')
  async getWallet(@CurrentUser() user: AuthUserType) {
    return await this.walletService.getWalletService(user.id);
  }

  @Get('transaction-history')
  async getTransactionHistory(
    @CurrentUser() user: AuthUserType,
    @Query() query: Record<string, string>,
  ) {
    return await this.walletService.getTransactionHistoryService(
      user.id,
      query,
    );
  }

  @Post('deposit-money')
  async depositMoneyIntoAccount(
    @Body() body: DepositMoneyDto,
    @CurrentUser() currentUser: AuthUserType,
  ) {
    const user_id = currentUser.id;
    const user_email = currentUser.email;
    const transaction_ref = Utilities.generateReference();

    return this.walletService.initiatePayment(
      user_id,
      body.transaction_type,
      body.transaction_amount,
      user_email,
      transaction_ref,
    );
  }

  @Get('withdraw-otp')
  async requestOtpForWithdrawal(@CurrentUser() user: AuthUserType) {
    return await this.walletService.requestOtpForWithdrawalService(
      user.id,
      user.email,
    );
  }

  @Post('withdraw')
  async withDrawMoney(
    @Body() withDrawnDto: WithdrawDto,
    @CurrentUser() user: AuthUserType,
  ) {
    return await this.walletService.withDrawMoneyService(
      withDrawnDto,
      user.email,
      user.id,
    );
  }
}
