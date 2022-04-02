import { NextFunction, Request, Response } from 'express';
import logger from '../../utils/logger';

export default (error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(error.message, error);
  next(error);
};
