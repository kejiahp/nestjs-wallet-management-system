import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/apps/auth/guards/auth.guard';
import { CreateWalletDto, DepositMoneyDto } from '../dto/wallet.dto';
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
}
