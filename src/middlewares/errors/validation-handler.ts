import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import ApiResponse from '../../models/api-response';

export default (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error?.name === 'ValidationError') {
    let validationsErrors: { [key: string]: string } = {};
    const errors = (error as any).errors;
    const keys = Object.keys(errors);
    keys.forEach((key) => {
      validationsErrors[key] = errors[key].message;
    });
    const apiResponse = new ApiResponse(validationsErrors, StatusCodes.UNPROCESSABLE_ENTITY);
    res.status(apiResponse.statusCode).json({ content: apiResponse.content, isSuccess: apiResponse.isSuccess });
  } else {
    next(error);
  }
};
