import chai from 'chai';
import spies from 'chai-spies';
import UserDal from '../src/data-access/user.dal';
import User from '../src/models/user';
const expect = chai.use(spies).expect;

describe('User dal', () => {
  afterEach(() => {
    chai.spy.restore(User);
  });

  it('should call findOne', () => {
    const spy = chai.spy.on(User, 'findOne');

    UserDal.getUserByUsername('test');

    expect(spy).to.have.called.with({ username: 'test' });
  });

  it('should call findOne on getUser', () => {
    const spy = chai.spy.on(User, 'findOne');

    UserDal.getUser({});

    expect(spy).to.have.called.with({});
  });

  it('should call findOneAndUpdate', () => {
    const spy = chai.spy.on(User, 'findOneAndUpdate');

    UserDal.updateUser({}, {});

    expect(spy).to.have.called();
  });

  it('should call find', () => {
    const spy = chai.spy.on(User, 'find');

    UserDal.getUsers();

    expect(spy).to.have.called();
  });

  it('should call findOneAndDelete', () => {
    const spy = chai.spy.on(User, 'findOneAndDelete');

    UserDal.deleteUser('');

    expect(spy).to.have.called();
  });

  it('should call exists', () => {
    const spy = chai.spy.on(User, 'exists');

    UserDal.checkUserExists('');

    expect(spy).to.have.called();
  });

  it('should call save', () => {
    const user = new User({ name: 'test' });
    const spy = chai.spy.on(user, 'save', function (cb) {
      cb(null);
    });

    UserDal.saveUser({});

    expect(spy).to.have.called();
  });
});
