import jwt from 'jsonwebtoken';

export default class JwtHelper {
  private static readonly _secretKey = process.env.jwt_secret_key as string;

  public static generateToken(userId: string, username: string, perms: readonly number[]): string {
    return jwt.sign({ username, perms }, this._secretKey, {
      expiresIn: '1d',
      audience: process.env.audience,
      issuer: process.env.issuer,
      subject: username
    });
  }

  public static verifyToken(token: string): jwt.Jwt {
    return jwt.verify(token, this._secretKey, { complete: true }) as jwt.Jwt;
  }
}
