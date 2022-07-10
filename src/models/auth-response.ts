import { LoginCode } from '../enums/login-response-code.enum';
import ApiResponse from './api-response';

export default class AuthResponse extends ApiResponse {
  code: LoginCode;

  constructor(content: any, statusCode: number, code: LoginCode) {
    super(content, statusCode);
    this.code = code;
  }
}
