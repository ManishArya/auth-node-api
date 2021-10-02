import express from 'express';
import verifyJwtToken from '../middlewares/verify-jwt-token';
import ApiErrorResponse from '../models/api-error-response';
import ManageUserService from '../services/manage-user.service';
import logger from '../utils/logger';
const router = express.Router();

/**
 * @openapi
 *  /manage/user/all:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    description: 'Get All Users'
 *    tags: [Manage User API]
 *    responses:
 *      200:
 *        description: Get All User Successfully
 *        $ref: '#/components/responses/200'
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ApiCollectionResponse'
 *      500:
 *        $ref: '#/components/responses/500'
 */

router.get('/all', verifyJwtToken, async (req, res) => {
  try {
    return res.json(await ManageUserService.getUsers());
  } catch (error) {
    logger.error(error, error);
    return res.status(500).json(new ApiErrorResponse());
  }
});

/**
 * @openapi
 *  /manage/user/{username}:
 *  delete:
 *    security:
 *      - bearerAuth: []
 *    description: 'Delete user'
 *    tags: [Manage User API]
 *    parameters:
 *     - name: username
 *       in: path
 *       type: string
 *    responses:
 *      200:
 *        $ref: '#/components/responses/200'
 *      500:
 *        $ref: '#/components/responses/500'
 */

router.delete('/:username?', verifyJwtToken, async (req, res) => {
  try {
    const username = req.params.username ?? (req as any).currentUser.username;
    return res.json(await ManageUserService.deleteUser(username));
  } catch (error) {
    logger.error(error, error);
    return res.status(500).json(new ApiErrorResponse(error));
  }
});

router.post('/deleteUserAccount', verifyJwtToken, async (req, res) => {
  try {
    const password = req.body.password;
    const username = (req as any).currentUser.username;
    return res.json(await ManageUserService.deleteUserAccount(password, username));
  } catch (error) {
    logger.error(error);
    return res.status(500).json(new ApiErrorResponse(error));
  }
});

export default router;
