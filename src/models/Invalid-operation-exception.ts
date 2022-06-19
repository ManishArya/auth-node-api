import { StatusCodes } from 'http-status-codes';

export class LocalizedException extends Error {
  public localizedMessageKey: string | undefined;
  public params: any;

  constructor(message: string, localizedMessageKey?: string, params?: any) {
    super(message);
    this.localizedMessageKey = localizedMessageKey;
    this.params = params;
  }
}

export class InvalidOperationException extends LocalizedException {
  public readonly statusCode = StatusCodes.BAD_REQUEST;
  constructor(message: string, localizedMessageKey?: string, params?: any) {
    super(message, localizedMessageKey, params);
    this.name = 'InvalidOperationException';
  }
}

export class NotFoundException extends LocalizedException {
  public readonly statusCode = StatusCodes.NOT_FOUND;

  constructor(message: string, localizedMessageKey: string, params?: any) {
    super(message, localizedMessageKey, params);
    this.name = 'NotFoundException';
  }
}

export class SecurityException extends Error {
  public readonly statusCode = StatusCodes.UNAUTHORIZED;

  constructor(message: string) {
    super(message);
    this.name = 'SecurityException';
  }
}
