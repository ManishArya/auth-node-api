import express from 'express';
import recaptchVerify from '../middlewares/recaptch-verify';
import verifyJwtToken from '../middlewares/verify-jwt-token';
import ApiResponse from '../models/api-response';
import { LocalizedInvalidOperationException } from '../models/Invalid-operation-exception';
import AuthService from '../services/auth.service';
import UserService from '../services/user.service';
import upload from '../utils/image-uploader';
import logger from '../utils/logger';
import MagicNumberUtility from '../utils/magic-number/magic-number-utility';
import BaseController from './base.controller';
const router = express.Router();

router.post('/', recaptchVerify, async (req, res, next) => {
  try {
    const { username, name, email, password } = req.body;
    logger.info(`User.Newuser beginning ${req.path}`);
    const result = await UserService.saveUser({ username, name, email, password });
    logger.info(`User.NewUser returning`);
    return BaseController.sendResponse(res, result);
  } catch (error) {
    next(error);
  }
});

router.put('/', verifyJwtToken, async (req, res, next) => {
  try {
    UserService.currentUsername = req.currentUsername;
    const { username, name, email, mobile } = req.body;
    logger.info(`User.Edit beginning ${req.path}`);
    const result = await UserService.editProfile({ username, name, email, mobile });
    logger.info(`User.Edit returning`);
    return BaseController.sendResponse(res, result);
  } catch (error) {
    next(error);
  }
});

router.put('/updateEmailAddress', verifyJwtToken, async (req, res, next) => {
  const { password, email } = req.body;
  UserService.currentUsername = req.currentUsername;

  try {
    logger.info(`User.updateEmailAddress beginning ${req.path}`);

    let result: ApiResponse;
    const filter = { username: req.currentUsername };
    result = await AuthService.validateUser(filter, password, req.__('passwordWrong'));

    if (!result.isSuccess) {
      return BaseController.sendResponse(res, new ApiResponse({ password: result.content }, result.statusCode));
    }

    result = await UserService.updateEmailAddress(email);

    logger.info(`User.updateEmailAddress returning`);

    return BaseController.sendResponse(res, result);
  } catch (error) {
    next(error);
  }
});

router.put('/uploadAvatar', verifyJwtToken, upload().single('avatar'), async (req, res, next) => {
  UserService.currentUsername = req.currentUsername;
  const avatar = req.file as Express.Multer.File;
  const fileBytes = avatar?.buffer;

  if (!fileBytes) {
    throw new LocalizedInvalidOperationException('poster have no content', 'posterContentValidation');
  }

  try {
    logger.info(`User.UploadAvatar beginning ${req.path}`);

    const m = new MagicNumberUtility(fileBytes, avatar.mimetype);

    if (!m.isImageType) {
      throw new LocalizedInvalidOperationException(
        'Poster contents don’t match the file extension.',
        'posterContentCheckValidation'
      );
    }

    const result = await UserService.updateAvatar(fileBytes);
    logger.info(`User.UploadAvatar returning`);
    return BaseController.sendResponse(res, result);
  } catch (error) {
    next(error);
  }
});

router.delete('/removeAvatar', verifyJwtToken, async (req, res, next) => {
  UserService.currentUsername = req.currentUsername;
  try {
    logger.info(`User.RemoveAvatar beginning ${req.path}`);
    const result = await UserService.updateAvatar();
    logger.info(`User.RemoveAvatar returning`);
    return BaseController.sendResponse(res, result);
  } catch (error) {
    next(error);
  }
});

router.get('/', verifyJwtToken, async (req, res, next) => {
  try {
    UserService.currentUsername = req.currentUsername;
    logger.info(`User.GetProfile beginning ${req.path}`);
    const profile = await UserService.getProfile();
    logger.info(`User.GetProfile returning`);
    return BaseController.sendResponse(res, profile);
  } catch (error) {
    next(error);
  }
});

export default router;
