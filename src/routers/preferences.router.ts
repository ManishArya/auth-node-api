import express from 'express';
import verifyJwtToken from '../middlewares/verify-jwt-token';
const router = express.Router();

router.get('/', verifyJwtToken);
router.post('/setDarkTheme', verifyJwtToken);
router.post('/setLocale', verifyJwtToken);

export default router;
