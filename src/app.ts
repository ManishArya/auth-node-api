import { asClass, createContainer, InjectionMode, Lifetime } from 'awilix';
import cors from 'cors';
import express from 'express';
import i18n from 'i18n';
import path from 'path';
import genericErrorHandler from './middlewares/errors/generic-error-handler';
import logHandler from './middlewares/errors/log-handler';
import validationHandler from './middlewares/errors/validation-handler';
import db from './startup/db';
import route from './startup/route';
import { Config } from './utils/config';
import logger from './utils/logger';

const container = createContainer({
  injectionMode: InjectionMode.CLASSIC
});

container.register({
  config: asClass(Config).setLifetime(Lifetime.SCOPED)
});

container.loadModules(['controllers/**/*.ts', 'services/**/*.ts', 'data-access/**/*.ts'], {
  formatName: 'camelCase',
  resolverOptions: {
    lifetime: Lifetime.SCOPED,
    register: asClass
  }
});

i18n.configure({
  locales: ['en', 'hi'],
  directory: path.join(__dirname, '/locales')
});

const app = express();

app.use((req, res, next) => {
  const listener = (err: any) => {
    if (!res.headersSent) next(err);
  };
  process.once('unhandledRejection', listener);
  next();
});

app.use((res, req, next) => {
  i18n.init(res, req, next);
  i18n.setLocale(res.getLocale());
});
app.use(express.json());
app.set('view engine', 'ejs');
app.use(cors());
route(app, container);
db();
app.use(logHandler);
app.use(validationHandler);
app.use(genericErrorHandler);

const port = process.env.PORT || 3000;

app.listen(port, () => logger.info(`App listening on port ${port}!`));

const callbackFunction = (err: any) => {
  logger.error(err);
  process.kill(process.pid);
  process.exit(1);
};

process.on('uncaughtException', callbackFunction);

export default app;
