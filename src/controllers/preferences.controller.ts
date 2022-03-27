import express from 'express';
import verifyJwtToken from '../middlewares/verify-jwt-token';
import ApiResponse from '../models/api-response';
import PreferencesService from '../services/preferences.service';
import logger from '../utils/logger';
import BaseController from './base.controller';

const router = express.Router();

router.get('/', verifyJwtToken, async (req, res, next) => {
  try {
    logger.info(`Preferences.Get beginning ${req.path}`);

    PreferencesService.currentUsername = req.currentUsername;
    const response = await PreferencesService.getPreferences();

    logger.info(`Preferences.Get returning`);

    return BaseController.sendResponse(res, response);
  } catch (error) {
    next(error);
  }
});

router.post('/', verifyJwtToken, async (req, res, next) => {
  try {
    logger.info(`Preferences.Post begining ${req.path}`);

    PreferencesService.currentUsername = req.currentUsername;

    logger.info(`Preferences.Post returning`);
  } catch (error) {
    next(error);
  }
});

router.post('/setDarkTheme', verifyJwtToken, async (req, res, next) => {
  try {
    logger.info(`Preferences.setDarkTheme begining ${req.path}`);

    PreferencesService.currentUsername = req.currentUsername;
    await PreferencesService.setDarkTheme(req.body.enableDarkTheme);

    logger.info(`Preferences.setDarkTheme returning`);

    return BaseController.sendResponse(res, new ApiResponse('update sucessfully'));
  } catch (error) {
    next(error);
  }
});

export default router;
