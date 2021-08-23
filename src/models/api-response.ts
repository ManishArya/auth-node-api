import { STATUS_CODE_SUCCESS } from '../constants/status-code.const';

/**
 * @openapi
 * components:
 *  schemas:
 *      ApiResponse:
 *          type: object
 *          properties:
 *              code:
 *                  type: number
 *                  enum:
 *                  - 0
 *                  - 1
 *                  - 2
 *              message:
 *                  type: string
 *          discriminator:
 *            propertyName: code
 */
export default class ApiResponse {
  private code: number;
  private message: string | undefined;
  constructor(code = STATUS_CODE_SUCCESS, message?: string) {
    this.code = code;
    this.message = message;
  }
}
