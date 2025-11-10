import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';

export class HttpValidationPipe extends ValidationPipe {
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

        return new BadRequestException({
          message: formattedErrors,
          status: HttpStatus.BAD_REQUEST,
        });
      },
    });
  }
}
