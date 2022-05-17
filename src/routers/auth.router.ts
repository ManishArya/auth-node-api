import express from 'express';
import AuthController from '../controllers/auth.controller';
import PasswordHistoryDAL from '../data-access/password-history.dal';
import UserDal from '../data-access/user.dal';
import recaptchVerify from '../middlewares/recaptch-verify';
import verifyJwtToken from '../middlewares/verify-jwt-token';
import AuthService from '../services/auth.service';
import MailService from '../services/mail.service';
import { Config } from '../utils/config';
const router = express.Router();
const authController = new AuthController(
  new AuthService(new UserDal(), new PasswordHistoryDAL(), new MailService(new Config()))
);
router.post('/token', recaptchVerify, authController.Token.bind(authController));

router.post('/sendPasswordResetLink', recaptchVerify, authController.ForgotPassword.bind(authController));

router.post('/changePassword', verifyJwtToken, authController.ChangePassword.bind(authController));

export default router;
