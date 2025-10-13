import { Module } from '@nestjs/common';
import { ChatModule } from './modules/chat/chat.module';
import { UserModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './modules/email.module';
import { SharedModule } from './modules/shared.module';
import { WinstonModule } from 'nest-winston';
import winston from 'winston';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ['.env.local'], isGlobal: true }),
    WinstonModule.forRoot({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.File({
          level: 'error',
          filename: 'logs/error.log',
        }),
        new winston.transports.File({
          level: 'warn',
          filename: 'logs/warn.log',
        }),
        new winston.transports.File({
          level: 'info',
          filename: 'logs/info.log',
        }),
      ],
    }),
    ChatModule,
    UserModule,
    EmailModule,
    SharedModule,
  ],
})
export class AppModule {}
