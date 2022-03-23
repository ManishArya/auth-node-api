import { Response } from 'express';
import { STATUS_CODE_GENERIC_ERROR, STATUS_CODE_UNPROCESSING } from '../constants/status-code.const';
import { LoginResponseCode } from '../enums/login-response-code.enum';
import ApiResponse from '../models/api-response';
import { InvalidOperationException } from '../models/Invalid-operation-exception';

export default abstract class BaseController {
  public static sendResponse(res: Response, apiResponse: ApiResponse, code?: LoginResponseCode) {
    const status = apiResponse.statusCode;
    return res.status(status).json({ code, content: apiResponse.content, isSuccess: apiResponse.isSuccess });
  }

  public static ToError(res: Response, error?: any) {
    const apiResponse = new ApiResponse(
      'There is an issue in processing of request. Please try after some time later !!!',
      STATUS_CODE_GENERIC_ERROR
    );

    if (error?.name === 'ValidationError') {
      let validationsErrors: { [key: string]: string } = {};
      const errors = error.errors;
      const keys = Object.keys(errors);
      keys.forEach((key) => {
        validationsErrors[key] = errors[key].message;
      });

      apiResponse.content = validationsErrors;
      apiResponse.statusCode = STATUS_CODE_UNPROCESSING;
    } else if (error?.name === 'MongoError' && error?.code === 11000) {
      let validationsErrors: { [key: string]: string } = {};
      const key = Object.keys(error.keyValue)[0];
      validationsErrors[key] = `${key} is taken`;
      apiResponse.content = validationsErrors;
    } else if (error instanceof InvalidOperationException) {
      apiResponse.content = error.message;
      apiResponse.statusCode = error.statusCode;
    }
    return this.sendResponse(res, apiResponse);
  }
}
