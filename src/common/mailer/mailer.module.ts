import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MailerRepositories } from './mailer.repositories';

@Module({
  exports: [MailerRepositories],
  providers: [MailerService, MailerRepositories],
})
export class MailerModule {}
