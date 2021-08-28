import chai from 'chai';
import chaiHttp from 'chai-http';
import spies from 'chai-spies';
import jwt from 'jsonwebtoken';
import UserService from '../src/services/user.service';
import logger from '../src/utils/logger';
import App from './../src/app';
const expect = chai.use(spies).use(chaiHttp).expect;

describe('User controller', () => {
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
    chai.spy.restore(UserService);
    chai.spy.restore(jwt);
    chai.spy.restore(logger);
  });

  it('should update user profile', (done) => {
    chai.spy.on(UserService, 'editProfile', () => Promise.resolve());

    chai
      .request(App)
      .put('/api/user')
      .set('authorization', 'Bearer 12345')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should update user profile endpoint return 500', (done) => {
    chai.spy.on(UserService, 'editProfile', () => {
      throw new Error();
    });

    chai
      .request(App)
      .put('/api/user')
      .set('authorization', 'Bearer 12345')
      .end((err, res) => {
        expect(res).to.have.status(500);
        done();
      });
  });

  it('should get profile endpoint return 200 status code', (done) => {
    chai.spy.on(UserService, 'getProfile', () => Promise.resolve());

    chai
      .request(App)
      .get('/api/user')
      .set('authorization', 'Bearer 12345')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should get profile endpoint return 500 status code if user service throws errors', (done) => {
    chai.spy.on(UserService, 'getProfile', () => {
      throw new Error();
    });

    chai
      .request(App)
      .get('/api/user')
      .set('authorization', 'Bearer 12345')
      .end((err, res) => {
        expect(res).to.have.status(500);
        done();
      });
  });
});
