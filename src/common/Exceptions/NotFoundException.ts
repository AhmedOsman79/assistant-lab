import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, NotFoundException } from '@nestjs/common';
import { ErrorResponse } from '../response';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    return response.status(404).json(
      new ErrorResponse({
        success: false,
        message: 'not found',
        statusCode: 404,
      }),
    );
  }
}
