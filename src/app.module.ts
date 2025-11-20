import { Module } from '@nestjs/common';
import { ChatModule } from './modules/chat/chat.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './modules/email.module';
import { SharedModule } from './modules/shared.module';
import { WinstonModule } from 'nest-winston';
import winston from 'winston';
import { ScheduleModule } from '@nestjs/schedule';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { UsersModule } from './modules/users/users.module';
import { ChatGateway } from './modules/chat/chat.gateways';
import { RoomModule } from './modules/room/room.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
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
    ScheduleModule.forRoot(),
    ChatModule,
    AuthModule,
    EmailModule,
    SharedModule,
    UsersModule,
    RoomModule,
  ],
  providers: [
    AppService,
    ChatGateway,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  controllers: [AppController],
  exports: [],
})
export class AppModule {}
