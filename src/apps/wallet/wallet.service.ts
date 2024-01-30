import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentService } from 'src/common/payment/payment.service';
import { CreateWalletDto, WithdrawDto } from './dto/wallet.dto';
import ResponseHandler from 'src/common/utils/ResponseHandler';
import { EncryptionService } from 'src/common/encryption/encryption.service';
import { ConfigService } from '@nestjs/config';
import { WebHookEventType } from 'src/common/payment/payment.types';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { namedJobQueueKeys, queueKeys } from 'src/common/constant/queue-keys';
import {
  Payload_Type,
  PaystackTransferExecptionType,
  WalletTransactionType,
} from './wallet.types';
import { Prisma } from '@prisma/client';
import { Utilities } from 'src/common/utils/utilities';
import { AxiosError } from 'axios';
import { RedisService } from 'src/common/caching/redis/redis.service';
import calculatePagination from 'src/common/utils/pagination';

@Injectable()
export class WalletService {
  constructor(
    @InjectQueue(queueKeys.walletQueue) private walletQueue: Queue,
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
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

  public async getWalletService(user_id: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: {
        user_id: user_id,
      },
    });

    if (!wallet) {
      return ResponseHandler.error(
        HttpStatus.NOT_FOUND,
        'User does not have a wallet.',
      );
    }

    return ResponseHandler.response(
      HttpStatus.OK,
      true,
      'User wallet found',
      wallet,
    );
  }

  public async getTransactionHistoryService(
    user_id: string,
    query: Record<string, string>,
  ) {
    const { page, limit, type } = query;
    const pageNo = parseInt(page) || 1;
    const limitNo = parseInt(limit) || 10;
    const transactionType = (type || '') as WalletTransactionType;

    const allowedTransactionTypes = ['WITHDRAWAL', 'ESCROW', 'DEPOSIT'];

    if (
      !transactionType ||
      !allowedTransactionTypes.includes(transactionType)
    ) {
      return ResponseHandler.error(
        HttpStatus.BAD_REQUEST,
        'Invalid transaction type, allowed options are ' +
          allowedTransactionTypes.join(','),
      );
    }

    let skipNo = 0;
    if (pageNo > 1) {
      skipNo = (pageNo - 1) * limitNo;
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        user_id: user_id,
        transaction_type: transactionType,
      },
      skip: skipNo,
      take: limitNo,
    });

    const count = await this.prisma.transaction.count({
      where: {
        user_id: user_id,
        transaction_type: transactionType,
      },
    });

    const pagination = calculatePagination(
      transactions,
      count,
      pageNo,
      limitNo,
    );

    return ResponseHandler.response(
      HttpStatus.OK,
      true,
      'Transactions result',
      pagination,
    );
  }

  public async initiatePayment(
    user_id: string,
    reason: 'DEPOSIT',
    amount: number,
    email: string,
    transaction_ref: string,
    callback_url?: any,
  ) {
    const wallet = await this.prisma.wallet.findUnique({
      where: {
        user_id: user_id,
      },
    });

    if (!wallet) {
      return ResponseHandler.error(
        HttpStatus.NOT_FOUND,
        'User does not have a wallet',
      );
    }

    if (!wallet.recipient_code) {
      return ResponseHandler.error(
        HttpStatus.BAD_REQUEST,
        'User does not have a recipient code, kindly get one',
      );
    }

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

  public async requestOtpForWithdrawalService(user_id: string, email: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { user_id: user_id },
    });

    if (!wallet) {
      return ResponseHandler.error(
        HttpStatus.NOT_FOUND,
        'user does not have a wallet',
      );
    }

    if (wallet.balance <= 0) {
      return ResponseHandler.error(
        HttpStatus.BAD_REQUEST,
        'Insufficent balance',
      );
    }

    await this.walletQueue.add(namedJobQueueKeys.transferInit, {
      email: email,
    });

    return ResponseHandler.response(
      HttpStatus.OK,
      true,
      'request for otp code successful, kindly check your mail box for an mail containg the code.',
    );
  }

  public async withDrawMoneyService(
    withdrawDto: WithdrawDto,
    email: string,
    user_id: string,
  ) {
    const otp = await this.redisService.getFromCache(
      `${email}-${namedJobQueueKeys.transferInit}-otp`,
    );

    if (!otp) {
      return ResponseHandler.error(HttpStatus.NOT_FOUND, 'Otp code not found');
    }

    if (otp !== withdrawDto.otp) {
      return ResponseHandler.error(
        HttpStatus.BAD_REQUEST,
        'Otp codes do not match',
      );
    }

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const transaction_ref = Utilities.generateReference();
          const wallet = await this.prisma.wallet.findUnique({
            where: {
              user_id: user_id,
            },
          });

          if (!wallet) {
            throw new HttpException(
              'User does not have a wallet',
              HttpStatus.NOT_FOUND,
            );
          }

          if (!wallet.recipient_code) {
            throw new HttpException(
              'User does not have a recipient code, kindly get one',
              HttpStatus.BAD_REQUEST,
            );
          }

          if (withdrawDto.amount > wallet.balance) {
            throw new HttpException(
              'Insufficent balance',
              HttpStatus.BAD_REQUEST,
            );
          }

          const amountInKobo = this.paymentService.convert_naira_to_kobo(
            withdrawDto.amount,
          );

          const transfer = await this.paymentService.makeTransferThrow(
            'balance',
            withdrawDto.transaction_type,
            amountInKobo,
            wallet.recipient_code,
            transaction_ref,
          );

          console.log('TRANSFER', transfer);

          if (!transfer || transfer.status === false) {
            throw new HttpException(
              `Transaction failed || ${transfer.message}`,
              HttpStatus.BAD_GATEWAY,
            );
          }

          await tx.transaction.create({
            data: {
              user_id: user_id,
              transaction_ref: transaction_ref,
              transaction_amount: withdrawDto.amount,
              transaction_type: withdrawDto.transaction_type,
            },
          });

          await this.redisService.deleteFromCache(
            `${email}-${namedJobQueueKeys.transferInit}-otp`,
          );

          return transfer;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        },
      );
    } catch (error: any) {
      if (error instanceof AxiosError) {
        const datax: AxiosError<PaystackTransferExecptionType> = error;

        let message = datax.response.data.message;

        if (datax.response.data?.meta?.nextStep) {
          message += ` || ${datax.response.data.meta.nextStep}`;
        }

        return ResponseHandler.error(HttpStatus.BAD_GATEWAY, message);
      } else {
        throw error;
      }
    }
  }

  public async webhookService(body: any, X_PAYSTACK_SIGNATURE: string) {
    //validate event
    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    const hash = this.encryptionService.hashPaystackWebHookPayload(
      body,
      secret,
    );

    if (hash !== X_PAYSTACK_SIGNATURE) {
      return {};
    }

    const event: WebHookEventType = body.event;
    const forWhat: Payload_Type['forWhat'] = body.data.metadata.forWhat;
    const transaction_ref: string = body.data.reference;
    const amount: number = body.data.amount;
    const email: string = body.data.customer.email;

    if (event === 'charge.success') {
      const payload: Payload_Type = {
        forWhat,
        transaction_ref,
        amount,
        email,
      };

      await this.walletQueue.add(namedJobQueueKeys.chargeSuccess, {
        payload,
      });
    }
    return {};
  }
}
