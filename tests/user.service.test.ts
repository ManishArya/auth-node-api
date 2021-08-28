import chai from 'chai';
import spies from 'chai-spies';
import { STATUS_CODE_NOT_FOUND } from '../src/constants/status-code.const';
import UserDal from '../src/data-access/user.dal';
import ApiDataResponse from '../src/models/api-data-response';
import ApiResponse from '../src/models/api-response';
import UserService from '../src/services/user.service';
const expect = chai.use(spies).expect;

describe('User Service', () => {
  beforeEach(() => {
    UserService.currentUser = { _id: 1, username: 'testUser' };
  });

  afterEach(() => {
    chai.spy.restore(UserDal);
  });

  describe('Update user profile', () => {
    beforeEach(() => {
      chai.spy.on(UserDal, 'updateUser', ({ _id }, userData) => {
        if (userData.username === 'testUser') {
          return Promise.resolve({ toObject: () => {} });
        }
        return undefined;
      });
    });

    it('should update user profile', async () => {
      const res = await UserService.editProfile({ username: 'testUser' });

      expect(res).to.instanceOf(ApiDataResponse);
    });

    it('should return not found when updating user profile', async () => {
      const res = await UserService.editProfile({ username: 'test' });

      expect(res).to.instanceOf(ApiResponse);
      expect(res['code']).to.equal(STATUS_CODE_NOT_FOUND);
    });
  });

  describe('Get user profile', () => {
    it('should return user profile', async () => {
      chai.spy.on(UserDal, 'getUserByUsername', () => Promise.resolve({ toObject: () => {} }));

      const res = await UserService.getProfile();

      expect(res).to.instanceOf(ApiDataResponse);
    });
  });
});
