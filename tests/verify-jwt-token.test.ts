import chai from 'chai';
import spies from 'chai-spies';
import jwt from 'jsonwebtoken';
import VerifyJWTTokenMiddleware from './../src/middlewares/verify-jwt-token';
const expect = chai.use(spies).expect;

describe('VerifyJWTTokenMiddleware', () => {
  afterEach(() => {
    chai.spy.restore(jwt);
  });

  it('should send unauthrorized message if token is not present', () => {
    const res = {
      status: (code: number) => {
        return { json: (message: string) => `${code} - ${message}` };
      }
    };

    const result = VerifyJWTTokenMiddleware(
      {
        headers: {
          authorization: '123'
        }
      } as any,
      res,
      () => {}
    );

    expect(result).to.equal(`401 - user is unauthorized`);
  });

  it('should ok if token is present in request header', () => {
    const req = {
      headers: {
        authorization: 'Bearer 1234'
      }
    } as any;

    chai.spy.on(jwt, 'verify', () => {
      return {
        payload: {}
      };
    });

    VerifyJWTTokenMiddleware(req, {}, () => {});

    expect(req.currentUser).to.not.undefined;
  });
});
