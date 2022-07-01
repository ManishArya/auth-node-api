import { asClass, createContainer, InjectionMode } from 'awilix';
import AuthController from '../controllers/auth.controller';
import PreferencesController from '../controllers/preferences.controller';
import UserController from '../controllers/user.controller';
import QueryDAL from '../data-access/query.dal';
import PreferencesManager from '../manager/preferences-manager';
import Email from '../models/email';
import PasswordHistory from '../models/password-history';
import Preferences from '../models/preferences';
import User from '../models/user';
import AuthService from '../services/auth.service';
import MailService from '../services/mail.service';
import PreferencesService from '../services/preferences.service';
import UserService from '../services/user.service';

export default () => {
  const container = createContainer({
    injectionMode: InjectionMode.CLASSIC
  });

  container.register({
    authController: asClass(AuthController).scoped(),
    authService: asClass(AuthService).scoped(),
    userDAL: asClass(QueryDAL)
      .scoped()
      .inject(() => ({ db: User })),
    userController: asClass(UserController).scoped(),
    userService: asClass(UserService).scoped(),
    preferencesController: asClass(PreferencesController).scoped(),
    preferencesService: asClass(PreferencesService).scoped(),
    preferencesManager: asClass(PreferencesManager).scoped(),
    passwordHistoryDAL: asClass(QueryDAL)
      .scoped()
      .inject(() => ({ db: PasswordHistory })),
    preferencesDAL: asClass(QueryDAL)
      .scoped()
      .inject(() => ({ db: Preferences })),
    mailService: asClass(MailService).scoped(),
    mailDAL: asClass(QueryDAL)
      .scoped()
      .inject(() => ({ db: Email }))
  });

  return container;
};
