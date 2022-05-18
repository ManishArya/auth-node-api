import express, { NextFunction, Request, Response } from 'express';
import recaptchVerify from '../middlewares/recaptch-verify';
import verifyJwtToken from '../middlewares/verify-jwt-token';
const router = express.Router();

const resolveDependency = (methodName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return (req as any).scope.resolve('authController')[methodName](req, res);
  };
};

router.post('/token', recaptchVerify, resolveDependency('Token'));

router.post('/sendPasswordResetLink', recaptchVerify, resolveDependency('ForgotPassword'));

router.post('/changePassword', verifyJwtToken, resolveDependency('ChangePassword'));

export default router;
