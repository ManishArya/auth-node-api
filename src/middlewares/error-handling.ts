import { NextFunction } from 'express';

export default (req: any, res: any, err: any, next: NextFunction) => {
  console.log(err);
};
