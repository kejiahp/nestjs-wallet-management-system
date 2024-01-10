import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionService {
  constructor(public readonly prisma: PrismaService) {}

  public async createSessionService({
    userId,
    userAgent,
  }: {
    userId: string;
    userAgent?: string;
  }) {
    const session = await this.prisma.session.create({
      data: {
        user_id: userId,
        userAgent: userAgent || '',
      },
    });

    return session;
  }

  public async findSessionById(sessionId: string) {
    return await this.prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    });
  }

  public async invalidateAllUserSessionService({ userId }: { userId: string }) {
    return await this.prisma.session.updateMany({
      where: {
        user_id: userId,
      },
      data: {
        is_valid: false,
      },
    });
  }

  public async invalidateSessionById(sessionId: string) {
    return await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        is_valid: false,
      },
    });
  }
}
