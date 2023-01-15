import jwt from 'jsonwebtoken';
import UserInfo from '../models/user-info';

export default class JwtHelper {
  private static readonly _secretKey = process.env.jwt_secret_key as string;

  public static generateToken(userInfo: UserInfo): string {
    const { _id, isAdmin, perms } = userInfo;
    return jwt.sign({ userId: _id, perms, isAdmin }, this._secretKey, {
      expiresIn: '1d',
      audience: process.env.audience,
      issuer: process.env.issuer,
      subject: _id?.toString()
    });
  }

  public static verifyToken(token: string): jwt.Jwt {
    return jwt.verify(token, this._secretKey, { complete: true }) as jwt.Jwt;
  }
}
