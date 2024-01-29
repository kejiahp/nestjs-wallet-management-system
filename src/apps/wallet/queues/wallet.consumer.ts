import { Processor, Process } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { Job } from 'bull';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/apps/prisma/prisma.service';
import { namedJobQueueKeys, queueKeys } from 'src/common/constant/queue-keys';
import { Logger } from 'winston';
import { Payload_Type } from '../wallet.types';
import { Prisma } from '@prisma/client';
import { Utilities } from 'src/common/utils/utilities';
import { MailerRepositories } from 'src/common/mailer/mailer.repositories';
import { RedisService } from 'src/common/caching/redis/redis.service';

@Processor(queueKeys.walletQueue)
export class WalletConsumer {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly prisma: PrismaService,
    private readonly mailRepo: MailerRepositories,
    private readonly redisService: RedisService,
  ) {}

  @Process(namedJobQueueKeys.chargeSuccess)
  async verfiyDeposit(job: Job<{ payload: Payload_Type }>) {
    this.logger.info(
      `initializing ${namedJobQueueKeys.chargeSuccess} queue for transaction ${job.data.payload.transaction_ref}`,
    );

    const transaction = await this.prisma.transaction.findUnique({
      where: {
        transaction_ref: job.data.payload.transaction_ref,
      },
    });

    if (!transaction) {
      return {};
    }

    const amountInNaira = Utilities.koboToNaira(job.data.payload.amount);

    if (amountInNaira !== transaction.transaction_amount) {
      await this.prisma.transaction.update({
        where: {
          transaction_ref: job.data.payload.transaction_ref,
        },
        data: {
          transaction_status: 'FAILED',
        },
      });

      await this.mailRepo.sendTransactionFailedMail(
        job.data.payload.email,
        transaction.transaction_type,
        'The amount you sent and the amount logged on our servers do not match. Kindly reach out to customer care.',
      );

      return {};
    }

    await this.prisma.$transaction(
      async (tx) => {
        const wallet = await tx.wallet.findUnique({
          where: {
            user_id: transaction.user_id,
          },
        });

        if (!wallet) {
          throw new Error(`${job.data.payload.email} does not have a wallet`);
        }

        await tx.wallet.update({
          where: {
            user_id: wallet.user_id,
          },
          data: {
            balance: {
              increment: transaction.transaction_amount,
            },
          },
        });

        await tx.transaction.update({
          where: {
            transaction_ref: job.data.payload.transaction_ref,
          },
          data: {
            transaction_status: 'APPROVED',
          },
        });
      },
      {
        maxWait: 5000, // default: 2000
        timeout: 10000, // default: 5000
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );

    const wallet = await this.prisma.wallet.findUnique({
      where: {
        user_id: transaction.user_id,
      },
    });

    await this.mailRepo.sendTransactionSuccessMail(
      job.data.payload.email,
      transaction.transaction_type,
      String(wallet.balance),
    );

    this.logger.info(
      `ended charge ${namedJobQueueKeys.chargeSuccess} queue for transaction ${job.data.payload.transaction_ref}`,
    );

    return {};
  }

  @Process(namedJobQueueKeys.transferInit)
  async sendTransferOtpCode(job: Job<{ email: string }>) {
    this.logger.info(
      `initializing ${namedJobQueueKeys.transferInit} queue for user ${job.data.email} transfer otp code`,
    );

    const ttl = Utilities.daysToSeconds(1);
    const otp = Utilities.generateRandomNumber(6);

    await this.redisService.savetoCache(
      `${job.data.email}-${namedJobQueueKeys.transferInit}-otp`,
      otp,
      ttl,
    );

    await this.mailRepo.sendTransferOtpCodeMail(otp, job.data.email);

    this.logger.info(
      `ended charge ${namedJobQueueKeys.transferInit} queue for user ${job.data.email} transfer otp code`,
    );

    return {};
  }
}
