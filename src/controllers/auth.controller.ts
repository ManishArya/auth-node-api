import express from 'express';
import { STATUS_CODE_SUCCESS } from '../constants/status-code.const';
import recaptchVerify from '../middlewares/recaptch-verify';
import verifyJwtToken from '../middlewares/verify-jwt-token';
import ApiResponse from '../models/api-response';
import AuthResponse from '../models/auth-response';
import ILogin from '../models/ILogin';
import { LocalizedInvalidOperationException } from '../models/Invalid-operation-exception';
import AuthService from '../services/auth.service';
import logger from '../utils/logger';
import BaseController from './base.controller';
const router = express.Router();

/**
 * @openapi
 *  /token/:
 *  post:
 *    description: 'Validate user is authenticate or not and generate jwt token'
 *    tags: [Authentication API]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Login'
 *          examples:
 *            loginWithUsername:
 *              $ref: '#/components/examples/loginWithUsername'
 *            loginWithEmail:
 *              $ref: '#/components/examples/loginWithEmail'
 *      required: true
 *    responses:
 *      200:
 *        description: return jwt token
 *        content:
 *          application/json:
 *            schema:
 *              oneOf:
 *              - $ref: '#/components/schemas/ApiDataResponse'
 *              - $ref: '#/components/schemas/ApiResponse'
 *            discriminator:
 *              propertyName: code
 *            examples:
 *              token:
 *                $ref: '#/components/examples/token'
 *              failure:
 *                $ref: '#/components/examples/failure'
 *      500:
 *        $ref: '#/components/responses/500'
 */

router.post('/token', recaptchVerify, async (req, res, next) => {
  try {
    const { usernameOrEmail, password } = req.body as ILogin;
    logger.info(`Auth.Token beginning ${req.path}`);
    let result: ApiResponse;
    const filter = { $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] };
    result = await AuthService.validateUser(filter, password);
    const loginResponseCode = (result as AuthResponse).code;
    if (result.statusCode === STATUS_CODE_SUCCESS) {
      const user = result.content;
      result = await AuthService.generateToken(user);
    }

    logger.info(`Auth.Token returning`);
    return BaseController.sendResponse(res, result, loginResponseCode);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 *  /forgetPassword/:
 *  post:
 *    description: 'Reset Password'
 *    tags: [Authentication API]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *            required:
 *            - username
 *      required: true
 *    responses:
 *      200:
 *        $ref: '#/components/responses/200'
 *      500:
 *        $ref: '#/components/responses/500'
 */

router.post('/forgetPassword', recaptchVerify, async (req, res, next) => {
  try {
    const { usernameOrEmail } = req.body;
    logger.info(`Auth.ForgetPassword beginning ${req.path}`);
    const result = await AuthService.sendResetPasswordLink(usernameOrEmail);
    logger.info(`Auth.ForgetPassword returning`);
    return BaseController.sendResponse(res, result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 *  /changePassword/:
 *  post:
 *    security:
 *      - bearerAuth: []
 *    description: 'Change Password of current user'
 *    tags: [Authentication API]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Password'
 *    responses:
 *      200:
 *        $ref: '#/components/responses/200'
 *      500:
 *        $ref: '#/components/responses/500'
 */

router.post('/changePassword', verifyJwtToken, async (req, res, next) => {
  try {
    logger.info(`Auth.ChangePassword beginning ${req.path}`);
    const currentUsername = req.currentUsername;
    const { password, confirmPassword, oldPassword } = req.body;

    if (password?.localeCompare(confirmPassword) !== 0) {
      throw new LocalizedInvalidOperationException(
        'password and confirm password does not match !!!',
        'passwordMismatch'
      );
    }

    let result: ApiResponse;
    const filter = { username: currentUsername };
    result = await AuthService.validateUser(filter, oldPassword, req.__('oldPasswordWrong'));

    if (result.statusCode === STATUS_CODE_SUCCESS) {
      const user = result.content;
      result = await AuthService.changePassword(user, password);
    }

    logger.info(`Auth.ChangePassword returning`);
    return BaseController.sendResponse(res, result);
  } catch (error) {
    next(error);
  }
});

export default router;
