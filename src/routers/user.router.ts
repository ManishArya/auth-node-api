import express from 'express';
import UserController from '../controllers/user.controller';
import PasswordHistoryDAL from '../data-access/password-history.dal';
import UserDal from '../data-access/user.dal';
import recaptchVerify from '../middlewares/recaptch-verify';
import verifyJwtToken from '../middlewares/verify-jwt-token';
import AuthService from '../services/auth.service';
import MailService from '../services/mail.service';
import UserService from '../services/user.service';
import { Config } from '../utils/config';
import upload from '../utils/image-uploader';

const router = express.Router();
const userController = new UserController(
  new AuthService(new UserDal(), new PasswordHistoryDAL(), new MailService(new Config())),
  new UserService(new UserDal(), new MailService(new Config()))
);

router.post('/', recaptchVerify, userController.SaveUser.bind(userController));
router.put('/', verifyJwtToken, userController.EditProfile.bind(userController));
router.put('/updateEmailAddress', verifyJwtToken, userController.UpdateEmailAddress.bind(userController));
router.put(
  '/uploadAvatar',
  verifyJwtToken,
  upload().single('avatar'),
  userController.UploadAvatar.bind(userController)
);
router.delete('/removeAvatar', verifyJwtToken, userController.RemoveAvatar.bind(userController));
router.get('/', verifyJwtToken, userController.GetProfile.bind(userController));
router.get('/all', verifyJwtToken, userController.GetAllUsers.bind(userController));
router.delete('/:username?', verifyJwtToken, userController.DeleteUser.bind(userController));
router.post('/deleteUserAccount', verifyJwtToken, userController.DeleteUserAccount.bind(userController));

export default router;
