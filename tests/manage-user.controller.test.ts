import chai from 'chai';
import chaiHttp from 'chai-http';
import spies from 'chai-spies';
import jwt from 'jsonwebtoken';
import ManageUserService from '../src/services/manage-user.service';
import logger from '../src/utils/logger';
import App from './../src/app';
const expect = chai.use(spies).use(chaiHttp).expect;

describe('ManageUserController ', () => {
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
    chai.spy.restore(ManageUserService);
    chai.spy.restore(jwt);
    chai.spy.restore(logger);
  });

  it('should save user', (done) => {
    chai.spy.on(ManageUserService, 'saveUser', () => Promise.resolve());

    chai
      .request(App)
      .post('/api/manage/user')
      .set('authorization', 'Bearer 12345')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should save user with photo', (done) => {
    chai.spy.on(ManageUserService, 'saveUser', () => Promise.resolve());

    chai
      .request(App)
      .post('/api/manage/user')
      .attach('photo', 'tests/files/test.png')
      .set('authorization', 'Bearer 12345')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should not save user if photo is not either png or jpg', (done) => {
    try {
      chai.spy.on(ManageUserService, 'saveUser', () => Promise.resolve());

      chai
        .request(App)
        .post('/api/manage/user')
        .attach('photo', 'tests/files/test.txt')
        .set('authorization', 'Bearer 12345')
        .end((err, res) => {
          expect(res).to.have.status(500);
          done();
        });
    } catch {}
  });

  it('should save user endpoint return 500', (done) => {
    chai.spy.on(ManageUserService, 'saveUser', () => {
      throw new Error();
    });

    chai
      .request(App)
      .post('/api/manage/user')
      .set('authorization', 'Bearer 12345')
      .end((err, res) => {
        expect(res).to.have.status(500);
        done();
      });
  });

  it('should all users endpoint return 200 status code', (done) => {
    chai.spy.on(ManageUserService, 'getUsers', () => Promise.resolve());

    chai
      .request(App)
      .get('/api/manage/user/all')
      .set('authorization', 'Bearer 12345')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should all users endpoint return 500 status code if ManageUser service throws errors', (done) => {
    chai.spy.on(ManageUserService, 'getUsers', () => {
      throw new Error();
    });

    chai
      .request(App)
      .get('/api/manage/user/all')
      .set('authorization', 'Bearer 12345')
      .end((err, res) => {
        expect(res).to.have.status(500);
        done();
      });
  });

  it('should delete endpoint return 200 status code', (done) => {
    chai.spy.on(ManageUserService, 'deleteUser', () => Promise.resolve());

    chai
      .request(App)
      .delete('/api/manage/user/test')
      .set('authorization', 'Bearer 12345')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should delete endpoint return 500 status code', (done) => {
    chai.spy.on(ManageUserService, 'deleteUser', () => {
      throw new Error();
    });

    chai
      .request(App)
      .delete('/api/manage/user/test')
      .set('authorization', 'Bearer 12345')
      .end((err, res) => {
        expect(res).to.have.status(500);
        done();
      });
  });
});
