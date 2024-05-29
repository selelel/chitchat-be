import { HttpException, HttpStatus } from '@nestjs/common';

export class ForbiddenException extends HttpException {
  constructor(message?: string) {
    super(message || 'ForbiddenException', HttpStatus.FORBIDDEN);
    Object.defineProperty(this, 'name', { value: 'ForbiddenException' });
  }
}

export class UnauthorizedError extends HttpException {
  constructor(message?: string) {
    super(message || 'UnauthorizedError', HttpStatus.UNAUTHORIZED);
    Object.defineProperty(this, 'name', { value: 'UnauthorizedError' });
  }
}
