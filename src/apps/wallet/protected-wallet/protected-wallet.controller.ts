import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/apps/auth/guards/auth.guard';
import { CreateWalletDto } from '../dto/wallet.dto';
import { WalletService } from '../wallet.service';
import { RequestAuthUserType } from 'src/apps/auth/types';

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
}
