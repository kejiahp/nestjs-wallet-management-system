import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentService } from 'src/common/payment/payment.service';
import { CreateWalletDto } from './dto/wallet.dto';
import ResponseHandler from 'src/common/utils/ResponseHandler';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
  ) {}

  public async createWallet(data: CreateWalletDto, user_id: string) {
    return await this.prisma.wallet.create({
      data: {
        user_id: user_id,
        address: data.address,
        country: data.country,
        bank_code: data.bank_code,
        bank_name: data.bank_name,
        account_name: data.account_name,
        account_number: data.account_number,
      },
    });
  }

  public async addRecipientCode(recipient_code: string, user_id: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: {
        user_id: user_id,
        recipient_code: null,
      },
    });

    if (!wallet) {
      return ResponseHandler.error(
        HttpStatus.NOT_FOUND,
        'User already as a recipient_code',
      );
    }

    return await this.prisma.wallet.update({
      where: {
        user_id: user_id,
        recipient_code: null,
      },
      data: {
        recipient_code: recipient_code,
      },
    });
  }
}
