declare namespace Express {
  interface Request {
    currentUsername: string;
    scope: any;
  }
}
