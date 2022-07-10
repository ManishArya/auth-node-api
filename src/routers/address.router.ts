import express from 'express';
import AddressController from '../controllers/address.controller';
import resolveDependency from '../middlewares/dependency-resolver';
import verifyJwtToken from '../middlewares/verify-jwt-token';
const router = express.Router();
let controllerName = AddressController.name;
controllerName = controllerName.charAt(0).toLowerCase() + controllerName.substr(1);

router.get('/', verifyJwtToken, resolveDependency(controllerName, 'getAllAddress'));

router.post('/', verifyJwtToken, resolveDependency(controllerName, 'addNewAddress'));

router.put('/', verifyJwtToken, resolveDependency(controllerName, 'updateAddress'));

router.delete('/', verifyJwtToken, resolveDependency(controllerName, 'deleteAddress'));

export default router;
