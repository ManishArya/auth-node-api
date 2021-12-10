import axios from 'axios';
import config from 'config';
import { NextFunction, Request } from 'express';
import qs from 'querystring';
import logger from '../utils/logger';

export default async (req: Request, res: any, next: NextFunction) => {
  const isRecaptchaEnabled = config.get('isRecaptchaEnabled');
  if (!isRecaptchaEnabled) {
    return next();
  }

  try {
    const recaptchaToken = req.body.recaptchaToken;
    if (recaptchaToken) {
      logger.info(`validating captcha....`);
      const requestPayload = {
        secret: process.env.recaptcha_secret_key,
        response: recaptchaToken
      };
      const response = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify`,
        qs.stringify(requestPayload),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      logger.info('Received response from captcha server....');

      if ((response.data as IReCaptcha).success) {
        return next();
      }

      throw new Error(((response.data as IReCaptcha)['error-codes'] as Array<any>)[0]);
    }
    throw new Error('Token is not present');
  } catch (err) {
    logger.error(err);
    return res.status(400).json({ message: 'Unable to verify captcha' });
  }
};

export interface IReCaptcha {
  success: boolean;
  challenge_ts: Date;
  hostname: string;
  'error-codes': [];
}
