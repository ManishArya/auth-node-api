import { NextFunction, Request, Response } from 'express';
import { STATUS_CODE_UNPROCESSING } from '../../constants/status-code.const';
import ApiResponse from '../../models/api-response';

export default (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error?.name === 'ValidationError') {
    let validationsErrors: { [key: string]: string } = {};
    const errors = (error as any).errors;
    const keys = Object.keys(errors);
    keys.forEach((key) => {
      validationsErrors[key] = errors[key].message;
    });
    const apiResponse = new ApiResponse(validationsErrors, STATUS_CODE_UNPROCESSING);
    res.status(apiResponse.statusCode).json({ content: apiResponse.content, isSuccess: apiResponse.isSuccess });
  } else {
    next(error);
  }
};
