import express from 'express';
import { STATUS_CODE_SUCCESS } from '../constants/status-code.const';
import verifyJwtToken from '../middlewares/verify-jwt-token';
import ApiResponse from '../models/api-response';
import AuthService from '../services/auth.service';
import ManageUserService from '../services/manage-user.service';
import logger from '../utils/logger';
import BaseController from './base.controller';
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

router.get('/all', verifyJwtToken, async (req, res, next) => {
  try {
    logger.info(`${router.name}.All beginning ${req.path}`);
    const response = await ManageUserService.getUsers();
    logger.info(`ManageUser.All returning`);
    return BaseController.sendResponse(res, response);
  } catch (error) {
    next(error);
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

router.delete('/:username?', verifyJwtToken, async (req, res, next) => {
  try {
    const username = req.params.username ?? req.currentUsername;
    logger.info(`ManageUser.Delete beginning ${req.path} ${req.route}`);
    const result = await ManageUserService.deleteUser(username);
    logger.info(`ManageUser.Delete returning`);
    return BaseController.sendResponse(res, result);
  } catch (error) {
    next(error);
  }
});

router.post('/deleteUserAccount', verifyJwtToken, async (req, res, next) => {
  try {
    const password = req.body.password;
    const username = req.currentUsername;
    logger.info(`ManageUser.DeleteUserAccount beginning ${req.path}`);

    let result: ApiResponse;
    const filter = { username };
    result = await AuthService.validateUser(filter, password, req.__('passwordWrong'));

    if (result.statusCode === STATUS_CODE_SUCCESS) {
      result = await ManageUserService.deleteUser(username);
    }

    logger.info(`ManageUser.DeleteUserAccount returning`);
    return BaseController.sendResponse(res, result);
  } catch (error) {
    next(error);
  }
});

export default router;
