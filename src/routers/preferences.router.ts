import express, { NextFunction, Request, Response } from 'express';
import verifyJwtToken from '../middlewares/verify-jwt-token';
const router = express.Router();

const resolveDependency = (methodName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return (req as any).scope.resolve('preferencesController')[methodName](req, res);
  };
};

router.get('/', verifyJwtToken, resolveDependency('GetPreferences'));
router.post('/setDarkTheme', verifyJwtToken, resolveDependency('setDarkTheme'));
router.post('/setLocale', verifyJwtToken, resolveDependency('setLocale'));

export default router;
