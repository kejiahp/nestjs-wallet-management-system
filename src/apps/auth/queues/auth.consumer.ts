import { Processor, Process } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { User as UserModel } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

import { MailerRepositories } from 'src/common/mailer/mailer.repositories';
import { Utilities } from 'src/common/utils/utilities';
import { Logger } from 'winston';
import { Job } from 'bull';
import { RedisService } from 'src/common/caching/redis/redis.service';
import { namedJobQueueKeys, queueKeys } from 'src/common/constant/queue-keys';

@Processor(queueKeys.authMailingQueue)
export class AuthMailingConsumer {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly redisService: RedisService,
    private mailRepository: MailerRepositories,
  ) {}

  @Process(namedJobQueueKeys.sendOtp)
  async sendOtp(job: Job<{ user: Omit<UserModel, 'password'> }>) {
    this.logger.info(`intializing otp mail for email: ${job.data.user.email}`);
    const otpCode = Utilities.generateRandomNumber(6);
    const otpTTL = Utilities.daysToSeconds(3);

    await this.redisService.savetoCache(
      `${job.data.user.email}-${namedJobQueueKeys.sendOtp}`,
      otpCode,
      otpTTL,
    );

    await this.mailRepository.sendEmailConfirmationMail(
      job.data.user,
      otpCode.toString(),
    );
    this.logger.info(`otp mail for email: ${job.data.user.email} was sent`);

    return {};
  }

  @Process(namedJobQueueKeys.emailVerified)
  async sendVerify(job: Job<{ user: Omit<UserModel, 'password'> }>) {
    this.logger.info(
      `initializing email verification success mail for email ${job.data.user.email}`,
    );

    await this.mailRepository.sendEmailVerificationSuccessMail(job.data.user);

    this.logger.info(
      `email verification success mail for email ${job.data.user.email} was sent`,
    );

    return {};
  }

  @Process(namedJobQueueKeys.passwordReset)
  async sendPasswordReset(job: Job<{ user: UserModel }>) {
    this.logger.info(
      `initializing password reset mail for email ${job.data.user.email}`,
    );

    const otpCode = Utilities.generateRandomNumber(6);
    const otpTTL = Utilities.daysToSeconds(3);

    await this.redisService.savetoCache(
      `${job.data.user.email}-${namedJobQueueKeys.passwordReset}`,
      otpCode,
      otpTTL,
    );

    await this.mailRepository.sendPasswordResetOptCode(job.data.user, otpCode);

    this.logger.info(`password reset mail for ${job.data.user.email} was sent`);

    return {};
  }
}
