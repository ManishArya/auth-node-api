import { asClass, createContainer, InjectionMode, Lifetime } from 'awilix';
import cors from 'cors';
import express from 'express';
import i18n from 'i18n';
import path from 'path';
import AuthController from './controllers/auth.controller';
import PreferencesController from './controllers/preferences.controller';
import UserController from './controllers/user.controller';
import { QueryDAL } from './data-access/query.dal';
import genericErrorHandler from './middlewares/errors/generic-error-handler';
import logHandler from './middlewares/errors/log-handler';
import validationHandler from './middlewares/errors/validation-handler';
import passwordHistory from './models/password-history';
import PreferencesManager from './models/preferences-manager';
import preferencesSchema from './models/preferences-schema';
import user from './models/user';
import AuthService from './services/auth.service';
import MailService from './services/mail.service';
import PreferencesService from './services/preferences.service';
import UserService from './services/user.service';
import db from './startup/db';
import route from './startup/route';
import { Config } from './utils/config';
import logger from './utils/logger';

const container = createContainer({
  injectionMode: InjectionMode.CLASSIC
});

container.register({
  authController: asClass(AuthController).scoped(),
  authService: asClass(AuthService).scoped(),
  userDAL: asClass(QueryDAL)
    .scoped()
    .inject(() => ({ schema: user })),
  userController: asClass(UserController).scoped(),
  userService: asClass(UserService).scoped(),
  preferencesController: asClass(PreferencesController).scoped(),
  preferencesService: asClass(PreferencesService).scoped(),
  preferencesManager: asClass(PreferencesManager).scoped(),
  passwordHistoryDAL: asClass(QueryDAL)
    .scoped()
    .inject(() => ({ schema: passwordHistory })),
  preferencesDAL: asClass(QueryDAL)
    .scoped()
    .inject(() => ({ schema: preferencesSchema })),
  mailService: asClass(MailService).scoped(),
  config: asClass(Config).setLifetime(Lifetime.SCOPED)
});

i18n.configure({
  locales: ['en', 'hi'],
  directory: path.join(__dirname, '/locales')
});

const app = express();

app.use((req, res, next) => {
  (req as any).scope = container.createScope();
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
