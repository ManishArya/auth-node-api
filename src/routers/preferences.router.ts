import express from 'express';
import PreferencesController from '../controllers/preferences.controller';
import verifyJwtToken from '../middlewares/verify-jwt-token';
import PreferencesService from '../services/preferences.service';
const router = express.Router();
const preferencesController = new PreferencesController(new PreferencesService());

router.get('/', verifyJwtToken, preferencesController.GetPreferences.bind(preferencesController));
router.post('/setDarkTheme', verifyJwtToken, preferencesController.setDarkTheme.bind(preferencesController));
router.post('/setLocale', verifyJwtToken, preferencesController.setLocale.bind(preferencesController));

export default router;
