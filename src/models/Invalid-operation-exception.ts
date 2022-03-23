import { STATUS_CODE_BAD_REQUEST } from '../constants/status-code.const';

export class InvalidOperationException extends Error {
  public readonly statusCode = STATUS_CODE_BAD_REQUEST;

  constructor(message: string) {
    super(message);
    this.name = 'InvalidOperations';
  }
}
