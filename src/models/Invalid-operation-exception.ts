import { STATUS_CODE_BAD_REQUEST } from '../constants/status-code.const';

export class InvalidOperationException extends Error {
  public readonly statusCode = STATUS_CODE_BAD_REQUEST;
  constructor(message: string) {
    super(message);
    this.name = 'InvalidOperations';
  }
}

export class LocalizedInvalidOperationException extends InvalidOperationException {
  public localizedMessageKey: string;
  public params: any;

  constructor(message: string, localizedMessageKey: string, params?: any) {
    super(message);
    this.localizedMessageKey = localizedMessageKey;
    this.params = params;
  }
}
