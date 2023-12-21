import { Processor, Process } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { User as UserModel } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { RedisService } from 'src/common/caching/redis/redis.service';
import { MailerRepositories } from 'src/common/mailer/mailer.repositories';
import { Utilities } from 'src/common/utils/utilities';
import { Logger } from 'winston';
import { Job } from 'bull';

@Processor('auth-mailing-queue')
export class AuthMailingConsumer {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private mailRepository: MailerRepositories,
    private redisService: RedisService,
  ) {}

  @Process('send-otp')
  async sendOtp(job: Job<{ user: Omit<UserModel, 'password'> }>) {
    this.logger.info(
      `intializing otp message for email: ${job.data.user.email}`,
    );
    const otpCode = Utilities.generateRandomNumber(6);
    const otpTTL = Utilities.secondsToDays(3);

    await this.redisService.savetoCache(
      `${job.data.user.email}-otp`,
      otpCode,
      otpTTL,
    );

    await this.mailRepository.sendEmailConfirmationMail(
      job.data.user,
      otpTTL.toString(),
    );
    this.logger.info(`otp message for email: ${job.data.user.email} was sent`);
  }
}
