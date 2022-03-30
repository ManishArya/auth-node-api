import express from 'express';
import { STATUS_CODE_SUCCESS } from '../constants/status-code.const';
import verifyJwtToken from '../middlewares/verify-jwt-token';
import ApiResponse from '../models/api-response';
import AuthService from '../services/auth.service';
import UserService from '../services/user.service';
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

router.get('/all', verifyJwtToken, async (req, res) => {
  logger.info(`${router.name}.All beginning ${req.path}`);
  const response = await UserService.getUsers();
  logger.info(`ManageUser.All returning`);
  return BaseController.sendResponse(res, response);
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
  const username = req.params.username ?? req.currentUsername;
  logger.info(`ManageUser.Delete beginning ${req.path} ${req.route}`);
  const result = await UserService.deleteUser(username);
  logger.info(`ManageUser.Delete returning`);
  return BaseController.sendResponse(res, result);
});

router.post('/deleteUserAccount', verifyJwtToken, async (req, res) => {
  const password = req.body.password;
  const username = req.currentUsername;
  logger.info(`ManageUser.DeleteUserAccount beginning ${req.path}`);

  let result: ApiResponse;
  const filter = { username };
  result = await AuthService.validateUser(filter, password, req.__('passwordWrong'));

  if (result.statusCode === STATUS_CODE_SUCCESS) {
    result = await UserService.deleteUser(username);
  }

  logger.info(`ManageUser.DeleteUserAccount returning`);
  return BaseController.sendResponse(res, result);
});

export default router;
