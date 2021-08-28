import { Application } from 'express';
import SwaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import auth from '../controllers/auth.controller';
import manageUser from '../controllers/manage-user.controller';
import user from '../controllers/user.controller';
/* eslint-disable */
const swaggerOptionsJson = require('./../../swagger/swagger-options.json');
const swaggerdoc = SwaggerJSDoc(swaggerOptionsJson);

export default function (app: Application) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerdoc));
  app.use('/api', auth);
  app.use('/api/user', user);
  app.use('/api/manage/user', manageUser);
}
