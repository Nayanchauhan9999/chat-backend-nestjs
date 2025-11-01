import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { User } from 'generated/prisma';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { errorMessages } from 'src/utils/response.messages';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: Request, response: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: errorMessages.TOKEN_IS_MISSING,
      });
    }

    try {
      const decode = this.jwtService.verify<User>(token);
      req.user = decode;
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

    next();
  }
}
