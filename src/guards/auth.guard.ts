import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Request } from 'express';
import { User } from 'generated/prisma';
import { SharedService } from 'src/services/shared.service';
import { errorMessages } from 'src/utils/response.messages';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly sharedService: SharedService,
  ) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      this.sharedService.sendError(
        errorMessages.TOKEN_IS_MISSING,
        HttpStatus.BAD_REQUEST,
      );
      return false;
    }

    try {
      const decode = this.jwtService.verify<User>(token);
      request.user = decode;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        this.sharedService.sendError(
          errorMessages.TOKEN_EXPIRED,
          HttpStatus.BAD_REQUEST,
        );
        return false;
      } else if (error instanceof JsonWebTokenError) {
        this.sharedService.sendError(
          errorMessages.INVALID_TOKEN_PROVIDED,
          HttpStatus.BAD_REQUEST,
        );
        return false;
      } else {
        this.sharedService.sendError(
          errorMessages.SOMETHING_WENT_WRONG,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
        return false;
      }
    }
    return true;
  }
}
