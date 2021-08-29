import chai from 'chai';
import chaiHttp from 'chai-http';
import spies from 'chai-spies';
import jwt from 'jsonwebtoken';
import ApiDataResponse from '../src/models/api-data-response';
import logger from '../src/utils/logger';
import App from './../src/app';
import AuthService from './../src/services/auth.service';

const expect = chai.use(spies).use(chaiHttp).expect;

describe('AuthController ', () => {
  beforeEach(() => {
    chai.spy.on(jwt, 'verify', (key) => {
      if (key === '12345') {
        return {
          payload: {}
        };
      }
      return undefined;
    });

    chai.spy.on(logger, 'error', () => {});
  });

  afterEach(() => {
    chai.spy.restore(AuthService);
    chai.spy.restore(jwt);
    chai.spy.restore(logger);
  });

  it('should return jwt token when call token endpoint', (done) => {
    chai.spy.on(AuthService, 'validateUser', () => Promise.resolve(new ApiDataResponse({ token: '12345' })));

    chai
      .request(App)
      .post('/api/token')
      .send({ username: 'admin', password: 'test' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.json;
        expect(res.body.data).to.property('token', '12345');
        done();
      });
  });

  it('should token endpoint return status 500 if auth service throws errors', (done) => {
    chai.spy.on(AuthService, 'validateUser', () => {
      throw new Error();
    });

    chai
      .request(App)
      .post('/api/token')
      .send({ username: 'admin', password: 'test' })
      .end((err, res) => {
        expect(res).to.have.status(500);
        done();
      });
  });

  it('should forgetPassword endpoint return status 500 if auth service throws errors', (done) => {
    chai.spy.on(AuthService, 'sendResetPasswordLink', () => {
      throw new Error();
    });

    chai
      .request(App)
      .post('/api/forgetPassword')
      .end((err, res) => {
        expect(res).to.have.status(500);
        done();
      });
  });

  it('should forgetPassword endpoint return status 200', (done) => {
    chai.spy.on(AuthService, 'sendResetPasswordLink', () => {});

    chai
      .request(App)
      .post('/api/forgetPassword')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should change password endpoint return 401 error code if no token is supplied', (done) => {
    chai
      .request(App)
      .post('/api/changePassword')
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });

  it('should change password endpoint return 200 status code if token is supplied', (done) => {
    chai.spy.on(AuthService, 'changePassword', () => Promise.resolve({}));

    chai
      .request(App)
      .post('/api/changePassword')
      .set('authorization', 'Bearer 12345')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should change password endpoint return 401 status code if token is not valid', (done) => {
    chai.spy.on(AuthService, 'changePassword', () => Promise.resolve({}));

    chai
      .request(App)
      .post('/api/changePassword')
      .set('authorization', 'Bearer 1234')
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });

  it('should changePassword endpoint return status 500 if auth service throws errors', (done) => {
    chai.spy.on(AuthService, 'changePassword', () => {
      throw new Error();
    });

    chai
      .request(App)
      .post('/api/changePassword')
      .set('authorization', 'Bearer 12345')
      .end((err, res) => {
        expect(res).to.have.status(500);
        done();
      });
  });
});
