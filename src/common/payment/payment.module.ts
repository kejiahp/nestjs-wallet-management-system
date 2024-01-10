import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Module({
  exports: [PaymentService],
  providers: [PaymentService],
})
export class PaymentModule {}
