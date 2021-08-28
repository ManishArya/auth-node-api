import bcrypt from 'bcrypt';
import chai from 'chai';
import spies from 'chai-spies';
import nodemailer from 'nodemailer';
import UserDal from '../src/data-access/user.dal';
import ManageUserService from '../src/services/manage-user.service';
const expect = chai.use(spies).expect;

describe('ManageUserService', () => {
  afterEach(() => {
    chai.spy.restore(nodemailer);
    chai.spy.restore(UserDal);
    chai.spy.restore(bcrypt);
  });

  it('should not create user if password does not meet policy criteria', async () => {
    const result = await ManageUserService.saveUser({ password: 'test' });
    expect(result).to.property('message', 'password does not meet policy criteria');
  });

  it('should send email if everyting is ok', async () => {
    chai.spy.on(bcrypt, 'hash', () => Promise.resolve({}));
    chai.spy.on(UserDal, 'saveUser', () => Promise.resolve({ name: 'manish', toObject: () => {} }));
    const transport = {
      sendMail: () => Promise.resolve({ messageId: 'success' })
    };
    chai.spy.on(nodemailer, 'createTransport', () => transport);
    const result = await ManageUserService.saveUser({ password: 'Test@123', username: 'manish' });
  });

  it('should be delete user successfully', async () => {
    chai.spy.on(UserDal, 'deleteUser', () => Promise.resolve({}));

    const result = await ManageUserService.deleteUser('manish');

    expect(result).to.property('message', 'User Deleted Successfully');
  });

  it('should be return all users', async () => {
    chai.spy.on(UserDal, 'getUsers', () => Promise.resolve([{ toObject: () => {} }]));

    const result = await ManageUserService.getUsers();

    expect(result['data']).to.instanceOf(Array);
  });
});
