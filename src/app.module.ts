import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './auth/user.module';
import { ConfigModule } from '@nestjs/config';
import { TestModule } from './test/test.module';
import { EmailModule } from './modules/email.module';
import { CommonModule } from './modules/common.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/sst-ai'),
    ConfigModule.forRoot({ envFilePath: ['.env.local'], isGlobal: true }),
    ChatModule,
    UserModule,
    TestModule,
    EmailModule,
    CommonModule,
  ],
})
export class AppModule {}
