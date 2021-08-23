import UserInfo from './user-info';

/**
 * @openapi
 * components:
 *  schemas:
 *    UserProfile:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *        email:
 *          type: string
 *          format: email
 *        mobile:
 *          type: string
 *        username:
 *          type: string
 *      required:
 *      - username
 *      - email
 */
export default class UserProfile extends UserInfo {
  _id: string;
  photo: string;
  constructor(data: any) {
    super(data);
    this._id = data._id;
    this.photo = data.photo;
  }
}
