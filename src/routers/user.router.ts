import express from 'express';
import resolveDependency from '../middlewares/dependency-resolver';
import recaptchVerify from '../middlewares/recaptch-verify';
import verifyJwtToken from '../middlewares/verify-jwt-token';
import upload from '../utils/image-uploader';

const router = express.Router();

router.post('/', recaptchVerify, resolveDependency('userController', 'SaveUser'));
router.put('/', verifyJwtToken, resolveDependency('userController', 'EditProfile'));
router.put('/updateEmailAddress', verifyJwtToken, resolveDependency('userController', 'UpdateEmailAddress'));
router.put(
  '/uploadAvatar',
  verifyJwtToken,
  upload().single('avatar'),
  resolveDependency('userController', 'UploadAvatar')
);
router.delete('/removeAvatar', verifyJwtToken, resolveDependency('userController', 'RemoveAvatar'));
router.get('/', verifyJwtToken, resolveDependency('userController', 'GetProfile'));
router.get('/all', verifyJwtToken, resolveDependency('userController', 'GetAllUsers'));
router.delete('/:username?', verifyJwtToken, resolveDependency('userController', 'DeleteUser'));
router.post('/deleteUserAccount', verifyJwtToken, resolveDependency('userController', 'DeleteUserAccount'));

export default router;
