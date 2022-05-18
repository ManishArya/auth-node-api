import express, { NextFunction, Request, Response } from 'express';
import recaptchVerify from '../middlewares/recaptch-verify';
import verifyJwtToken from '../middlewares/verify-jwt-token';
import upload from '../utils/image-uploader';

const router = express.Router();

const resolveDependency = (methodName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return (req as any).scope.resolve('userController')[methodName](req, res);
  };
};

router.post('/', recaptchVerify, resolveDependency('SaveUser'));
router.put('/', verifyJwtToken, resolveDependency('EditProfile'));
router.put('/updateEmailAddress', verifyJwtToken, resolveDependency('UpdateEmailAddress'));
router.put('/uploadAvatar', verifyJwtToken, upload().single('avatar'), resolveDependency('UploadAvatar'));
router.delete('/removeAvatar', verifyJwtToken, resolveDependency('RemoveAvatar'));
router.get('/', verifyJwtToken, resolveDependency('GetProfile'));
router.get('/all', verifyJwtToken, resolveDependency('GetAllUsers'));
router.delete('/:username?', verifyJwtToken, resolveDependency('DeleteUser'));
router.post('/deleteUserAccount', verifyJwtToken, resolveDependency('DeleteUserAccount'));

export default router;
