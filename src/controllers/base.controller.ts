import { Response } from 'express';
import { LoginCode } from '../enums/login-response-code.enum';
import ApiResponse from '../models/api-response';

export default abstract class BaseController {
  protected sendResponse(res: Response, apiResponse: ApiResponse, code?: LoginCode) {
    const status = apiResponse.statusCode;
    return res.status(status).json({ code, content: apiResponse.content, isSuccess: apiResponse.isSuccess });
  }
}
