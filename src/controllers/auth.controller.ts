import express from 'express';
import { STATUS_CODE_BAD_REQUEST, STATUS_CODE_SUCCESS } from '../constants/status-code.const';
import verifyJwtToken from '../middlewares/verify-jwt-token';
import ApiDataResponse from '../models/api-data-response';
import ApiErrorResponse from '../models/api-error-response';
import ApiResponse from '../models/api-response';
import AuthService from '../services/auth.service';
import logger from '../utils/logger';
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

router.post('/token', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    logger.info(`Auth.Token beginning ${req.path}`);
    let result: ApiResponse;
    const filter = { $or: [{ username }, { email }] };
    result = await AuthService.validateUser(filter, password);

    if (result.code === STATUS_CODE_SUCCESS) {
      const user = (result as ApiDataResponse<any>).data;
      result = await AuthService.generateToken(user);
    }

    logger.info(`Auth.Token returning`);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error(error);
    res.status(500).json(new ApiErrorResponse());
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

router.post('/forgetPassword', async (req, res) => {
  try {
    const { username, email } = req.body;
    logger.info(`Auth.ForgetPassword beginning ${req.path}`);
    const result = await AuthService.sendResetPasswordLink(username, email);
    logger.info(`Auth.ForgetPassword returning`);
    res.json(result);
  } catch (error) {
    logger.error(error, error);
    res.status(500).json(new ApiErrorResponse());
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

router.post('/changePassword', verifyJwtToken, async (req, res) => {
  try {
    logger.info(`Auth.ChangePassword beginning ${req.path}`);
    const currentUser = (req as any).currentUser;
    const { password, confirmPassword, oldPassword } = req.body;

    if (password?.localeCompare(confirmPassword) !== 0) {
      return res
        .status(400)
        .json(new ApiResponse(STATUS_CODE_BAD_REQUEST, 'password and confirm password does not match !!!'));
    }

    let result: ApiResponse;
    const filter = { username: currentUser.username };
    result = await AuthService.validateUser(filter, oldPassword, 'Old password is wrong !!!');

    if (result.code === STATUS_CODE_SUCCESS) {
      const user = (result as ApiDataResponse<any>).data;
      result = await AuthService.changePassword(user, password);
    }

    logger.info(`Auth.ChangePassword returning`);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error(error, error);
    return res.status(500).json(new ApiErrorResponse(error));
  }
});

export default router;
