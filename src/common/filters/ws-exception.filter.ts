import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { errorMessages } from 'src/utils/response.messages';

@Catch()
export class WsExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    const data = host.switchToWs().getData();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = errorMessages.INTERNAL_SERVER_ERROR;

    if (exception instanceof WsException) {
      const error = exception.getError();
      if (typeof error === 'string') {
        message = error;
        status = HttpStatus.BAD_REQUEST;
      } else if (typeof error === 'object' && error) {
        const maybeObj = error as Record<string, any>;
        message = (maybeObj.message as string) ?? message;
        status = (maybeObj.status as number) ?? HttpStatus.BAD_REQUEST;
      }
    } else if (exception instanceof Error) {
      message = exception.message ?? message;
    }

    const payload = {
      status,
      message,
    };

    try {
      client.emit('exception', payload);
    } catch (emitError) {
      console.error('Failed to emit WS exception', emitError, payload);
    }
  }
}
