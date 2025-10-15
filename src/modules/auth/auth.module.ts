import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthModule],
  imports: [
    JwtModule.register({
      global: true,
      secret: `${process.env.JWT_SECRET_KEY}`,
    }),
  ],
})
export class AuthModule {}
