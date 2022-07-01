import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { JsonWebTokenError } from 'jsonwebtoken';
import { MulterError } from 'multer';
import ApiResponse from '../../models/api-response';
import { InvalidOperationException } from '../../models/Invalid-operation-exception';

export default (error: any, req: Request, res: Response, next: NextFunction) => {
  const apiResponse = new ApiResponse(req.translate('genericErrorMessage'), StatusCodes.INTERNAL_SERVER_ERROR);

  if (error?.name === 'MongoError' && error?.code === 11000) {
    let validationsErrors: { [key: string]: string } = {};
    const key = Object.keys(error.keyValue)[0];
    validationsErrors[key] = `${key} is taken`;
    apiResponse.content = validationsErrors;
    apiResponse.statusCode = StatusCodes.BAD_REQUEST;
  } else if (error instanceof InvalidOperationException) {
    apiResponse.content = error.localizedMessageKey
      ? req.translateFormatter(error.localizedMessageKey, error.params)
      : error.message;
    apiResponse.statusCode = error.statusCode;
  } else if (error instanceof JsonWebTokenError) {
    apiResponse.statusCode = StatusCodes.UNAUTHORIZED;
    apiResponse.content = 'user is unauthorized';
  } else if (error instanceof MulterError) {
    if (error.field === 'avatar' && error.code === 'LIMIT_FILE_SIZE') {
      apiResponse.content = req.translate('posterSizeValidation');
      apiResponse.statusCode = StatusCodes.BAD_REQUEST;
    }
  }

  res.status(apiResponse.statusCode).json({ content: apiResponse.content, isSuccess: apiResponse.isSuccess });
};
