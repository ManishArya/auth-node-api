import express from 'express';
import resolveDependency from '../middlewares/dependency-resolver';
import verifyJwtToken from '../middlewares/verify-jwt-token';

const router = express.Router();

router.get('/', verifyJwtToken, resolveDependency('preferencesController', 'GetPreferences'));
router.post('/setDarkTheme', verifyJwtToken, resolveDependency('preferencesController', 'setDarkTheme'));
router.post('/setLocale', verifyJwtToken, resolveDependency('preferencesController', 'setLocale'));

export default router;
