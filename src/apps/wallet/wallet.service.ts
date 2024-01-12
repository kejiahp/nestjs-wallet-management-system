import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentService } from 'src/common/payment/payment.service';
import { CreateWalletDto, TransactionType } from './dto/wallet.dto';
import ResponseHandler from 'src/common/utils/ResponseHandler';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
  ) {}

  public async createWallet(data: CreateWalletDto, user_id: string) {
    const walletExist = await this.prisma.wallet.findUnique({
      where: {
        user_id,
      },
    });

    if (walletExist) {
      return ResponseHandler.error(
        HttpStatus.BAD_REQUEST,
        'User wallet already exists',
      );
    }

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

  public async initiatePayment(
    user_id: string,
    reason: TransactionType,
    amount: number,
    email: string,
    transaction_ref: string,
    callback_url?: any,
  ) {
    const callback = callback_url ? callback_url : null;

    await this.prisma.transaction.create({
      data: {
        user_id: user_id,
        transaction_amount: amount,
        transaction_ref: transaction_ref,
        transaction_type: reason,
      },
    });

    return await this.paymentService.initializePayment(
      reason,
      amount,
      email,
      transaction_ref,
      callback,
    );
  }

  public async addRecipientCode(user_id: string) {
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

    const newRecipient = await this.paymentService.createTransferRecipient(
      wallet.account_name,
      wallet.account_number,
      wallet.bank_code,
    );

    if (newRecipient.status === false) {
      return ResponseHandler.error(
        HttpStatus.BAD_GATEWAY,
        newRecipient.message,
      );
    }

    await this.prisma.wallet.update({
      where: {
        user_id: user_id,
        recipient_code: null,
      },
      data: {
        recipient_code: newRecipient.data.recipient_code,
      },
    });

    return ResponseHandler.response(
      HttpStatus.CREATED,
      true,
      'Recipient code successfully added',
    );
  }
}
