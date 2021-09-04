import express from 'express';
import verifyJwtToken from '../middlewares/verify-jwt-token';
import ApiErrorResponse from '../models/api-error-response';
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
    return res.json(await AuthService.validateUser(username, email, password));
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
    res.json(await AuthService.sendResetPasswordLink(username, email));
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
    AuthService.currentUser = (req as any).currentUser;
    const { password, confirmPassword, oldPassword } = req.body;
    const result = await AuthService.changePassword(password, confirmPassword, oldPassword);
    return res.status(result.code).json(result);
  } catch (error) {
    logger.error(error, error);
    return res.status(500).json(new ApiErrorResponse(error));
  }
});

export default router;
