import { NextFunction, Request } from 'express';
import JwtHelper from '../utils/jwt-helper';

export default (req: Request, res: any, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization as string;
    const type = 'Bearer ';
    if (authorization.startsWith(type)) {
      const token = authorization.split(type)[1];
      const decodeToken = JwtHelper.verifyToken(token);
      (req as any).currentUser = decodeToken.payload;
      return next();
    }
    throw new Error();
  } catch (err) {
    return res.status(401).json('user is unauthorized');
  }
};
