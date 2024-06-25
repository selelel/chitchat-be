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

export class ConflictError extends HttpException {
  constructor(message?: string) {
    super(message || 'ConflictError', HttpStatus.CONFLICT);
    Object.defineProperty(this, 'name', { value: 'ConflictError' });
  }
}

export class BadRequestException extends HttpException {
  constructor(message?: string) {
    super(message || 'BadRequestException', HttpStatus.BAD_REQUEST);
    Object.defineProperty(this, 'name', { value: 'BadRequestException' });
  }
}

export class NotFoundException extends HttpException {
  constructor(message?: string) {
    super(message || 'NotFoundException', HttpStatus.NOT_FOUND);
    Object.defineProperty(this, 'name', { value: 'NotFoundException' });
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message?: string) {
    super(
      message || 'InternalServerErrorException',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    Object.defineProperty(this, 'name', {
      value: 'InternalServerErrorException',
    });
  }
}
