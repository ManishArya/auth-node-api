import express from 'express';
import recaptchVerify from '../middlewares/recaptch-verify';
import verifyJwtToken from '../middlewares/verify-jwt-token';
import upload from '../utils/image-uploader';

const router = express.Router();

router.post('/', recaptchVerify);
router.put('/', verifyJwtToken);
router.put('/updateEmailAddress', verifyJwtToken);
router.put('/uploadAvatar', verifyJwtToken, upload().single('avatar'));
router.delete('/removeAvatar', verifyJwtToken);
router.get('/', verifyJwtToken);
router.get('/all', verifyJwtToken);
router.delete('/:username?', verifyJwtToken);
router.post('/deleteUserAccount', verifyJwtToken);

export default router;
