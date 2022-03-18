import express from 'express';
import verifyJwtToken from '../middlewares/verify-jwt-token';
import ApiResponse from '../models/api-response';
import PreferencesService from '../services/preferences.service';
import logger from '../utils/logger';
import BaseController from './base.controller';

const router = express.Router();

router.get('/', verifyJwtToken, async (req: any, res) => {
  try {
    logger.info(`Preferences.Get beginning ${req.path}`);

    PreferencesService.currentUser = req.currentUser;
    const response = await PreferencesService.getPreferences();

    logger.info(`Preferences.Get returning`);

    return BaseController.sendResponse(res, response);
  } catch (error) {
    logger.error(error, error);
    return BaseController.ToError(res, error);
  }
});

router.post('/', verifyJwtToken, async (req: any, res) => {
  try {
    logger.info(`Preferences.Post begining ${req.path}`);

    PreferencesService.currentUser = req.currentUser;

    logger.info(`Preferences.Post returning`);
  } catch (error) {
    logger.error(error, error);
    return BaseController.ToError(res, error);
  }
});

router.post('/setDarkTheme', verifyJwtToken, async (req, res) => {
  try {
    logger.info(`Preferences.setDarkTheme begining ${req.path}`);

    PreferencesService.currentUser = (req as any).currentUser;
    await PreferencesService.setDarkTheme(req.body.enableDarkTheme);

    logger.info(`Preferences.setDarkTheme returning`);

    return BaseController.sendResponse(res, new ApiResponse('update sucessfully'));
  } catch (error) {
    logger.error(error, error);
    return BaseController.ToError(res, error);
  }
});

export default router;
