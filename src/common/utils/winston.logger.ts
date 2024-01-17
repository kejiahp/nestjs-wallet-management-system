// import { ConfigService } from '@nestjs/config';
import { createLogger, format, transports } from 'winston';
const { combine, timestamp, label, printf } = format;

// const configService = new ConfigService();

const myFormat = printf(({ level, message, timestamp, label }) => {
  return `${label} [${timestamp}] [${level}]: ${message}`;
});

export const loggerFormat = combine(
  label({ label: 'LOG' }),
  timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  myFormat,
);

const winstonLogger = createLogger({
  level: 'debug',
  format: loggerFormat,
});

winstonLogger.add(new transports.Console());

// if (configService.get<string>('NODE_ENV') !== 'production') {
//   winstonLogger.add(new transports.Console());
// } else {
//   winstonLogger.add(
//     new transports.File({ filename: 'log/combine.log', level: 'info' }),
//   );
// }

export default winstonLogger;
