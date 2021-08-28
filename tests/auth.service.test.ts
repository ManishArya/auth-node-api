import bcrypt from 'bcrypt';
import chai from 'chai';
import spies from 'chai-spies';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import {
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_NOT_FOUND,
  STATUS_CODE_SUCCESS
} from '../src/constants/status-code.const';
import UserDal from '../src/data-access/user.dal';
import ApiDataResponse from '../src/models/api-data-response';
import AuthService from './../src/services/auth.service';
const expect = chai.use(spies).expect;

describe('Auth Service', () => {
  afterEach(() => {
    chai.spy.restore(nodemailer);
    chai.spy.restore(UserDal);
    chai.spy.restore(bcrypt);
    chai.spy.restore(jwt);
  });

  it('should return Bad request status code if password is empty', async () => {
    chai.spy.on(UserDal, 'getUser', () => Promise.resolve({}));
    const response = await AuthService.validateUser('admin', 'manisharya26@gmail.com', '');
    expect(response).to.have.property('code', STATUS_CODE_BAD_REQUEST);
  });

  it('should return  Success status code if password is not empty', async () => {
    chai.spy.on(UserDal, 'getUser', () => Promise.resolve({}));
    chai.spy.on(bcrypt, 'compare', () => Promise.resolve(true));
    chai.spy.on(jwt, 'sign', () => '1234');
    const response = await AuthService.validateUser('admin', 'manisharya26@gmail.com', 'test');
    expect(response).to.have.property('code', STATUS_CODE_SUCCESS);
    expect(response).to.instanceOf(ApiDataResponse);
    expect((response as ApiDataResponse<any>)['data']).to.have.property('token', '1234');
  });

  it('should return Not found status code if username does not match', async () => {
    chai.spy.on(UserDal, 'getUser', () => Promise.resolve(undefined));
    const result = await AuthService.sendResetPasswordLink('', '');
    expect(result).to.have.property('code', STATUS_CODE_NOT_FOUND);
  });

  it('should Success status code if username match', async () => {
    const transport = {
      sendMail: () => Promise.resolve({ messageId: 'success' })
    };
    chai.spy.on(nodemailer, 'createTransport', () => transport);
    chai.spy.on(UserDal, 'getUser', () => Promise.resolve({}));
    const result = await AuthService.sendResetPasswordLink('admin', '');
    expect(result).to.have.property('code', STATUS_CODE_SUCCESS);
  });

  it('should return mismatch password message if confirm and password does not match', async () => {
    const result = await AuthService.changePassword('test', 'Test');
    expect(result).to.have.property('message', 'password and confirm password does not match !!!');
  });

  it('should return password policy error message if password does not meet policy criteria', async () => {
    const result = await AuthService.changePassword('test', 'test');
    expect(result).to.have.property(
      'message',
      'Password should have at least 1 digit 1 upper case 1 lower case and 1 special characters and length should between 6 to 15'
    );
  });

  it('should return success message', async () => {
    chai.spy.on(UserDal, 'updateUser', () => Promise.resolve({}));
    chai.spy.on(bcrypt, 'hash', () => Promise.resolve({}));
    const transport = {
      sendMail: () => Promise.resolve({ messageId: 'success' })
    };
    chai.spy.on(nodemailer, 'createTransport', () => transport);
    const result = await AuthService.changePassword('Test@123', 'Test@123');
    expect(result).to.have.property('message', 'Password Changed Successfully');
  });
});
