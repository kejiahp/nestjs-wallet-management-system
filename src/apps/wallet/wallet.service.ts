import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentService } from 'src/common/payment/payment.service';
import { CreateWalletDto, TransactionType } from './dto/wallet.dto';
import ResponseHandler from 'src/common/utils/ResponseHandler';
import { EncryptionService } from 'src/common/encryption/encryption.service';
import { ConfigService } from '@nestjs/config';
import { WebHookEventType } from 'src/common/payment/payment.types';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { namedJobQueueKeys, queueKeys } from 'src/common/constant/queue-keys';

@Injectable()
export class WalletService {
  constructor(
    @InjectQueue(queueKeys.walletQueue) private walletQueue: Queue,
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService,
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

    const initPayment = await this.paymentService.initializePayment(
      reason,
      amount,
      email,
      transaction_ref,
      callback,
    );

    if (initPayment.status === false) {
      return ResponseHandler.error(
        HttpStatus.BAD_GATEWAY,
        'Failed to initialize payment' + ' # ' + initPayment.message,
      );
    }

    const amountToPay = this.paymentService.convert_naira_to_kobo(amount) / 100;

    await this.prisma.transaction.create({
      data: {
        user_id: user_id,
        transaction_amount: amountToPay,
        transaction_ref: transaction_ref,
        transaction_type: reason,
      },
    });

    return initPayment;
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

  public async webhookService(body: any, X_PAYSTACK_SIGNATURE: string) {
    //validate event
    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    const hash = this.encryptionService.hashPaystackWebHookPayload(
      body,
      secret,
    );
    console.log('HASH', X_PAYSTACK_SIGNATURE);
    console.log('BEFORE HASH VALIDATION', body);
    if (hash !== X_PAYSTACK_SIGNATURE) {
      return {};
    }

    const event: WebHookEventType = body.event;
    const forWhat: string = body.data.metadata.forWhat;
    const transaction_ref: string = body.data.reference;
    const amount: number = body.data.amount;

    if (event === 'charge.success') {
      const payload = {
        body,
        forWhat,
        transaction_ref,
        amount,
      };

      console.log('BEFORE QUEUE', body);

      await this.walletQueue.add(namedJobQueueKeys.chargeSuccess, {
        payload,
      });

      return {};
    }
  }
}
