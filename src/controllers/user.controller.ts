import express from 'express';
import logger from '../utils/logger';
import upload from '../utils/image-uploader';
import UserService from '../services/user.service';
import ApiErrorResponse from '../models/api-error-response';
import verifyJwtToken from '../middlewares/verify-jwt-token';
const router = express.Router();

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
 *        multipart/form-data:
 *          schema:
 *            properties:
 *              photo:
 *                type: string
 *                format: binary
 *            allOf:
 *            - $ref: '#/components/schemas/UserProfile'
 *    responses:
 *      200:
 *        description: User Profile Updated
 *      500:
 *        $ref: '#/components/responses/500'
 */

router.put('/', verifyJwtToken, upload().single('photo'), async (req: any, res) => {
  try {
    UserService.currentUser = req.currentUser;
    const { username, name, email, mobile } = req.body;
    const file = req.file;
    res.json(await UserService.editProfile({ username, name, email, mobile, photo: file?.buffer }));
  } catch (error) {
    logger.error(error, error);
    return res.status(500).json(new ApiErrorResponse(error));
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
    return res.json(await UserService.getProfile());
  } catch (error) {
    logger.error(error, error);
    return res.status(500).json(new ApiErrorResponse());
  }
});

export default router;
