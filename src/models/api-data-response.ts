import ApiResponse from './api-response';
/**
 * @openapi
 * components:
 *  schemas:
 *      ApiDataResponse:
 *          type: object
 *          properties:
 *              data:
 *                  oneOf:
 *                  - $ref: '#/components/schemas/UserProfile'
 *                  - $ref: '#/components/schemas/Token'
 *          anyOf:
 *          - $ref: '#/components/schemas/ApiResponse'
 *          discriminator:
 *            propertyName: code
 */
export default class ApiDataResponse<T> extends ApiResponse {
  public data: T;
  constructor(data: T) {
    super();
    this.data = data;
  }
}
