declare namespace Express {
  interface Request extends Awilix {
    currentUsername: string;
  }
  interface Awilix {
    scope: import('awilix').AwilixContainer;
  }
}
