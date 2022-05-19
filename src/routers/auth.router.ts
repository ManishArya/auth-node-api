import express from 'express';
import resolveDependency from '../middlewares/dependency-resolver';
import recaptchVerify from '../middlewares/recaptch-verify';
import verifyJwtToken from '../middlewares/verify-jwt-token';
const router = express.Router();

router.post('/token', recaptchVerify, resolveDependency('authController', 'Token'));

router.post('/sendPasswordResetLink', recaptchVerify, resolveDependency('authController', 'ForgotPassword'));

router.post('/changePassword', verifyJwtToken, resolveDependency('authController', 'ChangePassword'));

export default router;
