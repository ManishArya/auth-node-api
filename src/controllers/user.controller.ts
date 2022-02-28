import express from 'express';
import { STATUS_CODE_BAD_REQUEST } from '../constants/status-code.const';
import recaptchVerify from '../middlewares/recaptch-verify';
import verifyJwtToken from '../middlewares/verify-jwt-token';
import ApiResponse from '../models/api-response';
import AuthService from '../services/auth.service';
import UserService from '../services/user.service';
import upload from '../utils/image-uploader';
import logger from '../utils/logger';
import BaseController from './base.controller';
const router = express.Router();

router.post('/', recaptchVerify, async (req, res) => {
  try {
    const { username, name, email, password } = req.body;
    logger.info(`User.Newuser beginning ${req.path}`);
    const result = await UserService.saveUser({ username, name, email, password });
    logger.info(`User.NewUser returning`);
    return BaseController.sendResponse(res, result);
  } catch (error) {
    logger.error(error, error);
    return BaseController.ToError(res, error);
  }
});

/**
 * @openapi
 *  /user/:
 *  put:
 *    security:
 *      - bearerAuth: []
 *    description: 'Update User Profile'
 *    tags: [User API]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/UpdateModel'
 *    responses:
 *      200:
 *        description: User Profile Updated
 *      500:
 *        $ref: '#/components/responses/500'
 */

router.put('/', verifyJwtToken, async (req: any, res) => {
  try {
    UserService.currentUser = req.currentUser;
    const { username, name, email, mobile } = req.body;
    logger.info(`User.Edit beginning ${req.path}`);
    const result = await UserService.editProfile({ username, name, email, mobile });
    logger.info(`User.Edit returning`);
    return BaseController.sendResponse(res, result);
  } catch (error) {
    logger.error(error, error);
    return BaseController.ToError(res, error);
  }
});

router.put('/updateEmailAddress', verifyJwtToken, async (req: any, res) => {
  const { password, email } = req.body;
  UserService.currentUser = req.currentUser;

  try {
    logger.info(`User.updateEmailAddress beginning ${req.path}`);

    let result: ApiResponse;
    const filter = { username: UserService.currentUser.username };
    result = await AuthService.validateUser(filter, password, 'Password is wrong !!!');

    if (!result.isSuccess) {
      return BaseController.sendResponse(res, new ApiResponse({ password: result.content }, result.statusCode));
    }

    result = await UserService.updateEmailAddress(email);

    logger.info(`User.updateEmailAddress returning`);

    return BaseController.sendResponse(res, result);
  } catch (error) {
    logger.error(error, error);
    return BaseController.ToError(res, error);
  }
});

router.put('/uploadAvatar', verifyJwtToken, upload().single('avatar'), async (req: any, res) => {
  UserService.currentUser = req.currentUser;
  const avatar = req.file?.buffer;
  if (!avatar) {
    return BaseController.sendResponse(res, new ApiResponse('No avatar', STATUS_CODE_BAD_REQUEST));
  }
  try {
    logger.info(`User.UploadAvatar beginning ${req.path}`);
    const result = await UserService.updateAvatar(avatar);
    logger.info(`User.UploadAvatar returning`);
    return BaseController.sendResponse(res, result);
  } catch (error) {
    logger.error(error, error);
    return BaseController.ToError(res, error);
  }
});

router.delete('/removeAvatar', verifyJwtToken, async (req: any, res) => {
  UserService.currentUser = req.currentUser;
  try {
    logger.info(`User.RemoveAvatar beginning ${req.path}`);
    const result = await UserService.updateAvatar();
    logger.info(`User.RemoveAvatar returning`);
    return BaseController.sendResponse(res, result);
  } catch (error) {
    logger.error(error, error);
    return BaseController.ToError(res, error);
  }
});

/**
 * @openapi
 *  /user/:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    description: 'Get User Profile'
 *    tags: [User API]
 *    responses:
 *      200:
 *        description: User Profile
 *      500:
 *        $ref: '#/components/responses/500'
 */

router.get('/', verifyJwtToken, async (req: any, res: any) => {
  try {
    UserService.currentUser = req.currentUser;
    logger.info(`User.GetProfile beginning ${req.path}`);
    const profile = await UserService.getProfile();
    logger.info(`User.GetProfile returning`);
    return BaseController.sendResponse(res, profile);
  } catch (error) {
    logger.error(error, error);
    return BaseController.ToError(res, error);
  }
});

export default router;
