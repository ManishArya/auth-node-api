import { Response } from 'express';
import { LoginResponseCode } from '../enums/login-response-code.enum';
import ApiResponse from '../models/api-response';

export default abstract class BaseController {
  public static sendResponse(res: Response, apiResponse: ApiResponse, code?: LoginResponseCode) {
    const status = apiResponse.statusCode;
    return res.status(status).json({ code, content: apiResponse.content, isSuccess: apiResponse.isSuccess });
  }
}
