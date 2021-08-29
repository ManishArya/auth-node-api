import { NextFunction, Request } from 'express';
import jwt from 'jsonwebtoken';

export default (req: Request, res: any, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization as string;
    const type = 'Bearer ';
    if (authorization.startsWith(type)) {
      const token = authorization.split(type)[1];
      const secretKey = process.env.jwt_secret_key as jwt.Secret;
      const decodeToken = jwt.verify(token, secretKey, { complete: true }) as jwt.Jwt;
      (req as any).currentUser = decodeToken.payload;
      return next();
    }
    throw new Error();
  } catch (err) {
    return res.status(401).json('user is unauthorized');
  }
};
