import { LoginResponseCode } from '../enums/login-response-code.enum';
import ApiResponse from './api-response';

export default class AuthResponse extends ApiResponse {
  code: LoginResponseCode;

  constructor(content: any, statusCode: number, code: LoginResponseCode) {
    super(content, statusCode);
    this.code = code;
  }
}
