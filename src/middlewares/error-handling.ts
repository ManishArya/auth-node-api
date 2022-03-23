import { NextFunction } from 'express';
import { STATUS_CODE_GENERIC_ERROR } from '../constants/status-code.const';
import ApiResponse from '../models/api-response';
import { InvalidOperationException } from '../models/Invalid-operation-exception';

export default (err: any, req: any, res: any, next: NextFunction) => {
  const apiResponse = new ApiResponse(
    'There is an issue in processing of request. Please try after some time later !!!',
    STATUS_CODE_GENERIC_ERROR
  );

  if (err instanceof InvalidOperationException) {
    apiResponse.statusCode = err.statusCode;
    apiResponse.content = err.message;
  }

  res.status(apiResponse.statusCode).json({ content: apiResponse.content, isSuccess: apiResponse.isSuccess });
};
