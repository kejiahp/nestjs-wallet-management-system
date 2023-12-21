import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   *
   * @param key cache indentifier key
   * @param value cache value
   * @param ttl cache expiration time in seconds
   */
  public async savetoCache(
    key: string,
    value: string,
    ttl = 10,
  ): Promise<void> {
    await this.cacheManager.set(key, value, { ttl: ttl });
  }

  public async getFromCache(key: string): Promise<string | null> {
    const value = await this.cacheManager.get<string>(key);
    return value;
  }

  public async deleteFromCache(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  public async resetCache(): Promise<void> {
    await this.cacheManager.reset();
  }
}
