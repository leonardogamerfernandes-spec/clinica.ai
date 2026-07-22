import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as any).message || JSON.stringify(exceptionResponse)
        : exceptionResponse as string;
    } else if (exception instanceof Error) {
      // Safely catch other standard runtime exceptions and format them
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: message,
      error: status === HttpStatus.INTERNAL_SERVER_ERROR ? 'InternalServerError' : 'BadRequestError',
    });
  }
}
