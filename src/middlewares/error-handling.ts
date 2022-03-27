import { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import {
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_GENERIC_ERROR,
  STATUS_CODE_UNPROCESSING
} from '../constants/status-code.const';
import ApiResponse from '../models/api-response';
import { InvalidOperationException, LocalizedInvalidOperationException } from '../models/Invalid-operation-exception';
import logger from '../utils/logger';

export default (error: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(error.message, error);
  const apiResponse = new ApiResponse(req.__('genericErrorMessage'), STATUS_CODE_GENERIC_ERROR);

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
  } else if (error instanceof LocalizedInvalidOperationException) {
    apiResponse.content = res.__mf(error.localizedMessageKey, error.params);
    apiResponse.statusCode = error.statusCode;
  } else if (error instanceof InvalidOperationException) {
    apiResponse.content = error.message;
    apiResponse.statusCode = error.statusCode;
  } else if (error instanceof MulterError) {
    if (error.field === 'avatar' && error.code === 'LIMIT_FILE_SIZE') {
      apiResponse.statusCode = STATUS_CODE_BAD_REQUEST;
      apiResponse.content = req.__('posterSizeValidation');
    }
  }

  res.status(apiResponse.statusCode).json({ content: apiResponse.content, isSuccess: apiResponse.isSuccess });
};
