import { Processor, Process } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { Job } from 'bull';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/apps/prisma/prisma.service';
import { namedJobQueueKeys, queueKeys } from 'src/common/constant/queue-keys';
import { Logger } from 'winston';

type PayloadType = {
  body: any;
  forWhat: string;
  transaction_ref: string;
  amount: number;
};

@Processor(queueKeys.walletQueue)
export class DepositConsumer {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly prisma: PrismaService,
  ) {}

  @Process(namedJobQueueKeys.chargeSuccess)
  async verfiyDeposit(job: Job<{ payload: PayloadType }>) {
    this.logger.info(
      `initializing ${namedJobQueueKeys.chargeSuccess} queue for transaction ${job.data.payload.transaction_ref}`,
    );

    console.log('PAYLOAD', job.data.payload);

    // const transaction = await this.prisma.transaction.findUnique({
    //   where: {
    //     transaction_ref: job.data.payload.transaction_ref,
    //   },
    // });

    this.logger.info(
      `ended charge ${namedJobQueueKeys.chargeSuccess} queue for transaction ${job.data.payload.transaction_ref}`,
    );
  }
}
