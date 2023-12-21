import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        isGlobal: true,
        store: redisStore,
        host: configService.get('REDIS_CACHE_HOST'),
        port: configService.get('REDIS_CACHE_PORT'),
        ttl: configService.get('REDIS_CACHE_TTL'),
        auth_pass: configService.get('REDIS_PASSWORD'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
