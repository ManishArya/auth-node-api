import {
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_NOT_FOUND,
  STATUS_CODE_UNAUTHORIZED
} from '../constants/status-code.const';

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
  public readonly statusCode = STATUS_CODE_BAD_REQUEST;
  constructor(message: string, localizedMessageKey?: string, params?: any) {
    super(message, localizedMessageKey, params);
    this.name = 'InvalidOperationException';
  }
}

export class NotFoundException extends LocalizedException {
  public readonly statusCode = STATUS_CODE_NOT_FOUND;
  constructor(message: string, localizedMessageKey: string, params?: any) {
    super(message, localizedMessageKey, params);
    this.name = 'NotFoundException';
  }
}

export class SecurityException extends Error {
  public readonly statusCode = STATUS_CODE_UNAUTHORIZED;
  constructor(message: string) {
    super(message);
    this.name = 'SecurityException';
  }
}
