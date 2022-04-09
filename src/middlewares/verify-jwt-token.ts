import { NextFunction, Request } from 'express';
import i18n from 'i18n';
import { JsonWebTokenError } from 'jsonwebtoken';
import PreferencesManager from '../models/preferences-manager';
import JwtHelper from '../utils/jwt-helper';
import logger from '../utils/logger';

export default async (req: Request, res: any, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization as string;
    const scheme = 'Bearer ';
    if (authorization.startsWith(scheme)) {
      const token = authorization.split(scheme)[1];
      const decodeToken = JwtHelper.verifyToken(token);
      logger.info(`User is authenticate againts Bearer scheme`);
      req.currentUsername = decodeToken.payload['username'];
      const p = PreferencesManager.Current(req.currentUsername);
      const locale = await p.getUserLocale();
      req.setLocale(locale);
      i18n.setLocale(locale);
      return next();
    }
    throw new Error('token is not Bearer type. Bearer token is valid token');
  } catch (err) {
    next(new JsonWebTokenError(err.message, err));
  }
};
