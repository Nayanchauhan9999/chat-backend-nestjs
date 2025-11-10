import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

export class WsValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors
          .map((err) =>
            Object.values(err.constraints as Record<string, string>),
          )
          .flat();

        return new WsException({
          status: HttpStatus.BAD_REQUEST,
          message: formattedErrors,
        });
      },
    });
  }
}
