export default interface BaseSchema {
  _id: string;
  createdBy: string;
  lastUpdatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}
