import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariablesEnum } from 'src/utils/constant';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthModule],
  imports: [
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(EnvironmentVariablesEnum.JWT_SECRET_KEY),
      }),
    }),
  ],
})
export class AuthModule {}
