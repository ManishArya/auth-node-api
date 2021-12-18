import { STATUS_CODE_SUCCESS } from '../constants/status-code.const';

export default class ApiResponse {
  public statusCode: number;
  public content: any;
  constructor(content: any, statusCode = STATUS_CODE_SUCCESS) {
    this.statusCode = statusCode;
    this.content = content;
  }

  public get isSuccess(): boolean {
    return this.statusCode === STATUS_CODE_SUCCESS;
  }
}
