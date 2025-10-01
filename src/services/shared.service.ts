import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { errorMessages } from 'src/utils/response.messages';

@Injectable()
export class SharedService {
  sendSuccess<T = any>(
    message: string,
    statusCode: HttpStatus = HttpStatus.OK,
    data?: T,
  ) {
    return {
      message,
      status: statusCode,
      ...(data !== undefined && { data }),
    };
  }

  sendError(
    message: string = errorMessages.INTERNAL_SERVER_ERROR,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    throw new HttpException(
      {
        status: statusCode,
        message: message,
      },
      statusCode,
    );
  }
}
