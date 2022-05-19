import { NextFunction, Request, Response } from 'express';

export default (controllerName: string, methodName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return req.scope.resolve(controllerName)[methodName](req, res);
  };
};
