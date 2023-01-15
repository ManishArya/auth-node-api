import express from 'express';
import resolveDependency from '../middlewares/dependency-resolver';
import recaptchVerify from '../middlewares/recaptch-verify';
import verifyJwtToken from '../middlewares/verify-jwt-token';
import upload from '../utils/image-uploader';

const router = express.Router();

router.post('/', recaptchVerify, resolveDependency('userController', 'saveUser'));
router.put('/', verifyJwtToken, resolveDependency('userController', 'editProfile'));
router.put('/updateEmailAddress', verifyJwtToken, resolveDependency('userController', 'updateEmailAddress'));
router.put(
  '/uploadAvatar',
  verifyJwtToken,
  upload().single('avatar'),
  resolveDependency('userController', 'uploadAvatar')
);
router.delete('/removeAvatar', verifyJwtToken, resolveDependency('userController', 'removeAvatar'));
router.get('/', verifyJwtToken, resolveDependency('userController', 'getProfile'));
router.get('/all', verifyJwtToken, resolveDependency('userController', 'getAllUsers'));
router.delete('/:userId?', verifyJwtToken, resolveDependency('userController', 'deleteUser'));
router.post('/deleteUserAccount', verifyJwtToken, resolveDependency('userController', 'deleteUserAccount'));
router.get('/permissions', verifyJwtToken, resolveDependency('userController', 'getUserPermissions'));

export default router;
