import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './auth/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/sst-ai'),
    ConfigModule.forRoot({ envFilePath: ['.env.local'] }),
    ChatModule,
    UserModule,
  ],
})
export class AppModule {}
