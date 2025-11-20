import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { Prisma } from 'generated/prisma';
import { errorMessages } from 'src/utils/response.messages';

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientValidationError,
  Prisma.PrismaClientInitializationError,
)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();

    console.error('Prisma error:', exception);

    // Handle specific Prisma errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          // User tried to create a record with a unique field that already exists
          return response.status(HttpStatus.BAD_REQUEST).json({
            status: HttpStatus.BAD_REQUEST, // 409 Conflict status code : but used 400
            message: String(exception?.meta?.target) + ' already exists',
          });

        case 'P2025':
          // trying to update or delete a non-existent record in the database
          return response.status(HttpStatus.BAD_REQUEST).json({
            status: HttpStatus.BAD_REQUEST,
            message: errorMessages.RECORD_NOT_FOUND,
          });

        case 'P2003':
          return response.status(HttpStatus.BAD_REQUEST).json({
            status: HttpStatus.BAD_REQUEST,
            message: 'Invalid reference. Some required records do not exist',
          });

        case 'P2018':
          return response.status(HttpStatus.BAD_REQUEST).json({
            status: HttpStatus.BAD_REQUEST,
            message: 'Invalid or missing related records',
          });

        default:
          return response.status(HttpStatus.BAD_REQUEST).json({
            status: HttpStatus.BAD_REQUEST,
            message: 'Database operation failed',
            code: exception.code,
          });
      }
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Validation error',
      });
    }

    if (exception instanceof Prisma.PrismaClientInitializationError) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database connection failed',
      });
    }

    // Generic database error
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Database error occurred',
    });
  }
}
