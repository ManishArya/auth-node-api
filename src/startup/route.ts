import { AwilixContainer } from 'awilix';
import { Application } from 'express';
import SwaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import authRoute from '../routers/auth.router';
import preferencesRoute from '../routers/preferences.router';
import userRoute from '../routers/user.router';
/* eslint-disable */
const swaggerOptionsJson = require('./../../swagger/swagger-options.json');
const swaggerdoc = SwaggerJSDoc(swaggerOptionsJson);

export default function (app: Application, container: AwilixContainer) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerdoc));
  app.use('/api', authRoute);
  app.use('/api/user', userRoute);
  app.use('/api/preferences', preferencesRoute);
}
