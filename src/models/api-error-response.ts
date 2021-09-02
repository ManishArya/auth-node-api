import { STATUS_CODE_GENERIC_ERROR } from '../constants/status-code.const';
import ApiResponse from './api-response';
/**
 * @openapi
 * components:
 *  schemas:
 *    ApiErrorResponse:
 *      type: object
 *      properties:
 *      anyOf:
 *      - $ref: '#/components/schemas/ApiResponse'
 *      discriminator:
 *        propertyName: code
 */
export default class ApiErrorResponse extends ApiResponse {
  private errorMessages: { [key: string]: string } = {};
  constructor(error?: any) {
    super(STATUS_CODE_GENERIC_ERROR);
    if (error?.name === 'ValidationError') {
      const errors = error.errors;
      const keys = Object.keys(errors);
      keys.forEach((key) => {
        this.errorMessages[key] = errors[key].message;
      });
    } else if (error?.name === 'MongoError' && error?.code === 11000) {
      const keyValue = error.keyValue;
      const key = Object.keys(keyValue)[0];
      this.errorMessages[key] = `${key} is alreay present`;
    } else {
      this.errorMessages['error'] = 'There is an issue in processing of request. Please try after some time later !!!';
    }
  }
}
