import express from 'express';
import recaptchVerify from '../middlewares/recaptch-verify';
import verifyJwtToken from '../middlewares/verify-jwt-token';
const router = express.Router();

router.post('/token', recaptchVerify);

router.post('/sendPasswordResetLink', recaptchVerify);

router.post('/changePassword', verifyJwtToken);

export default router;
