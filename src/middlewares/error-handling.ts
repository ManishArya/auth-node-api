import { NextFunction } from 'express';
import { STATUS_CODE_GENERIC_ERROR } from '../constants/status-code.const';
import ApiResponse from '../models/api-response';

export default (err: any, req: any, res: any, next: NextFunction) => {
  let apiResponse = new ApiResponse(err.message, STATUS_CODE_GENERIC_ERROR);
  res.status(500).json({ content: apiResponse.content, isSuccess: apiResponse.isSuccess });
};
