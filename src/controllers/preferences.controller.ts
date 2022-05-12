import { Request, Response } from 'express';
import ApiResponse from '../models/api-response';
import PreferencesService from '../services/preferences.service';
import logger from '../utils/logger';
import BaseController from './base.controller';

export default class PreferencesController extends BaseController {
  public async GetPreferences(req: Request, res: Response) {
    logger.info(`Preferences.Get beginning ${req.path}`);

    PreferencesService.currentUsername = req.currentUsername;
    const response = await PreferencesService.getPreferences();

    logger.info(`Preferences.Get returning`);

    return this.sendResponse(res, response);
  }

  public setDarkTheme = async (req: Request, res: Response) => {
    logger.info(`Preferences.setDarkTheme beginning ${req.path}`);

    PreferencesService.currentUsername = req.currentUsername;
    await PreferencesService.setDarkTheme(req.body.enableDarkTheme);

    logger.info(`Preferences.setDarkTheme returning`);

    return this.sendResponse(res, new ApiResponse('update sucessfully'));
  };

  public setLocale = async (req: Request, res: Response) => {
    logger.info(`Preferences.setLocale beginning ${req.path}`);

    PreferencesService.currentUsername = req.currentUsername;
    await PreferencesService.setLocale(req.body.locale);

    logger.info(`Preferences.setLocale returning`);

    return this.sendResponse(res, new ApiResponse('update sucessfully'));
  };
}
