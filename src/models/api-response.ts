import { StatusCodes } from 'http-status-codes';

export default class ApiResponse {
  public statusCode: number;
  public content: any;

  constructor(content: any, statusCode = StatusCodes.OK) {
    this.statusCode = statusCode;
    this.content = content;
  }

  public get isSuccess(): boolean {
    return this.statusCode === StatusCodes.OK;
  }
}
