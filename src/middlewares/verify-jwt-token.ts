import { NextFunction, Request } from 'express';
import PreferencesManager from '../models/preferences-manager';
import JwtHelper from '../utils/jwt-helper';
import logger from '../utils/logger';

export default async (req: Request, res: any, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization as string;
    const type = 'Bearer ';
    if (authorization.startsWith(type)) {
      const token = authorization.split(type)[1];
      const decodeToken = JwtHelper.verifyToken(token);
      logger.info(`User is authenticate`);
      req.currentUsername = (decodeToken.payload as any).username;
      const p = new PreferencesManager(req.currentUsername);
      const locale = await p.getUserLocale();
      req.setLocale(locale);
      return next();
    }
    throw new Error();
  } catch (err) {
    next(err);
  }
};
