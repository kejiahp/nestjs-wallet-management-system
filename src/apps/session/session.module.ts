import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SessionService],
})
export class SessionModule {}
