import { Request, Response } from 'express';
import ApiResponse from '../models/api-response';
import PreferencesService from '../services/preferences.service';
import logger from '../utils/logger';
import BaseController from './base.controller';

export default class PreferencesController extends BaseController {
  private readonly _preferencesService: PreferencesService;

  constructor(private preferencesService: PreferencesService) {
    super();
    this._preferencesService = preferencesService;
  }

  public GetPreferences = async (req: Request, res: Response) => {
    logger.info(`Preferences.Get beginning ${req.path}`);

    const response = await this._preferencesService.getPreferences();

    logger.info(`Preferences.Get returning`);

    return this.sendResponse(res, response);
  };

  public setDarkTheme = async (req: Request, res: Response) => {
    logger.info(`Preferences.setDarkTheme beginning ${req.path}`);

    await this._preferencesService.setDarkTheme(req.body.enableDarkTheme);

    logger.info(`Preferences.setDarkTheme returning`);

    return this.sendResponse(res, new ApiResponse('update sucessfully'));
  };

  public setLocale = async (req: Request, res: Response) => {
    logger.info(`Preferences.setLocale beginning ${req.path}`);

    await this._preferencesService.setLocale(req.body.locale);

    logger.info(`Preferences.setLocale returning`);

    return this.sendResponse(res, new ApiResponse('update sucessfully'));
  };
}
