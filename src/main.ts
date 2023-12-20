import createServer, {
  CreateServerOptions,
} from './bootstrap-server/create-server';
import winstonLogger from './common/utils/winston.logger';

async function bootstrap() {
  try {
    winstonLogger.info('Initializing Server');
    winstonLogger.info(
      `Running in ${
        process.env.NODE_ENV === 'production' ? 'production' : 'development'
      } mode`,
    );

    const isProduction = process.env.NODE_ENV === 'production' ? true : false;

    const whitelisted_origins: string = process.env.WHITE_LISTED_DOMAINS;
    const whitelistedDomains = whitelisted_origins.split(',');

    const options: CreateServerOptions = {
      port: Number(process.env.PORT) || 5000,
      production: isProduction,
      whitelistedDomains: whitelistedDomains,
    };

    await createServer(options);

    winstonLogger.info(`Server running on port ${options.port}`);
  } catch (error) {
    winstonLogger.error(error);
  }
}
bootstrap();
