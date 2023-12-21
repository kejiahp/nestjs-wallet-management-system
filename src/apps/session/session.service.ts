import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionService {
  constructor(public readonly prisma: PrismaService) {}
}
