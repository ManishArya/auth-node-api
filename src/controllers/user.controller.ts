import express from 'express';
import { STATUS_CODE_BAD_REQUEST } from '../constants/status-code.const';
import recaptchVerify from '../middlewares/recaptch-verify';
import verifyJwtToken from '../middlewares/verify-jwt-token';
import ApiResponse from '../models/api-response';
import UserService from '../services/user.service';
import upload from '../utils/image-uploader';
import logger from '../utils/logger';
import BaseController from './base.controller';
const router = express.Router();

/**
 * @openapi
 *  /user/:
 *  post:
 *    description: 'Add New User'
 *    tags: [Manage User API]
 *    requestBody:
 *      content:
 *        multipart/form-data:
 *          schema:
 *            properties:
 *              photo:
 *                type: string
 *                format: binary
 *              password:
 *                type: string
 *            allOf:
 *            - $ref: '#/components/schemas/UserProfile'
 *    responses:
 *      200:
 *        description: Added New User Successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserProfile'
 *      500:
 *        $ref: '#/components/responses/500'
 */

router.post('/', recaptchVerify, upload().single('photo'), async (req, res) => {
  try {
    const file = req.file;
    const { username, name, email, mobile, password } = req.body;
    logger.info(`User.Newuser beginning ${req.path}`);
    const result = await UserService.saveUser({ username, name, email, mobile, password, photo: file?.buffer });
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

router.put('/uploadPhoto', verifyJwtToken, upload().single('photo'), async (req: any, res) => {
  UserService.currentUser = req.currentUser;
  const photo = req.file?.buffer;
  if (!photo) {
    return BaseController.sendResponse(res, new ApiResponse('No photo', STATUS_CODE_BAD_REQUEST));
  }
  try {
    logger.info(`User.UploadPhoto beginning ${req.path}`);
    const result = await UserService.updatePhoto(photo);
    logger.info(`User.UploadPhoto returning`);
    return BaseController.sendResponse(res, result);
  } catch (error) {
    logger.error(error, error);
    return BaseController.ToError(res, error);
  }
});

router.delete('/removePhoto', verifyJwtToken, async (req: any, res) => {
  UserService.currentUser = req.currentUser;
  try {
    logger.info(`User.RemovePhoto beginning ${req.path}`);
    const result = await UserService.updatePhoto();
    logger.info(`User.RemovePhoto returning`);
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
