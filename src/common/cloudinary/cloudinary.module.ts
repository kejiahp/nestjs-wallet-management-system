import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

@Module({
  exports: [CloudinaryService],
  providers: [CloudinaryService],
})
export class CloudinaryModule {}
