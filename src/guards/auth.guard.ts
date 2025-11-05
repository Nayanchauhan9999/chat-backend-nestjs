import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { User } from 'generated/prisma';
import { Observable } from 'rxjs';
import { errorMessages } from 'src/utils/response.messages';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: errorMessages.TOKEN_IS_MISSING,
      });
    }

    try {
      const decode = this.jwtService.verify<User>(token);
      request.user = decode;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return response.status(HttpStatus.BAD_REQUEST).json({
          status: HttpStatus.BAD_REQUEST,
          message: errorMessages.TOKEN_EXPIRED,
        });
      } else if (error instanceof JsonWebTokenError) {
        return response.status(HttpStatus.BAD_REQUEST).json({
          status: HttpStatus.BAD_REQUEST,
          message: errorMessages.INVALID_TOKEN_PROVIDED,
        });
      } else {
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: errorMessages.SOMETHING_WENT_WRONG,
        });
      }
    }
    return true;
  }
}
