import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import IBaseSchema from '../models/IBaseSchema';

export default class QueryDAL<T extends IBaseSchema> {
  protected readonly DBSchema: Model<T>;

  constructor(schema: Model<T>) {
    this.DBSchema = schema;
  }

  public async GetFilteredRecord(filterQuery: FilterQuery<T>) {
    return await this.DBSchema.findOne(filterQuery);
  }

  public async GetFilterRecordWithChild(filterQuery: FilterQuery<T>, path: string) {
    return await this.DBSchema.findOne(filterQuery).populate(path).exec();
  }

  public async GetLeanSingleRecord(filterQuery: FilterQuery<T>): Promise<T> {
    return await this.DBSchema.findOne(filterQuery).lean();
  }

  public async GetNRecords(n: number, filterQuery: FilterQuery<T>) {
    return await this.DBSchema.find(filterQuery).lean().limit(n);
  }

  public async GetFilteredRecords(filterQuery: FilterQuery<T>) {
    return await this.DBSchema.find(filterQuery);
  }

  public async GetRecords() {
    return await this.DBSchema.find();
  }

  public async DeleteRecord(filterQuery: FilterQuery<T>) {
    return await this.DBSchema.findOneAndDelete(filterQuery);
  }

  public async IsRecordExists(filterQuery: FilterQuery<T>) {
    return await this.DBSchema.exists(filterQuery);
  }

  public async SaveRecord(record: T) {
    const newDbSchema = new this.DBSchema(record);
    return (await newDbSchema.save()) as unknown as T;
  }

  public async FindAndUpdateRecord(filterQuery: FilterQuery<T>, updateQuery: UpdateQuery<T>) {
    return await this.DBSchema.findOneAndUpdate(filterQuery, updateQuery, {
      returnOriginal: false,
      runValidators: true
    }).lean();
  }

  public async UpdateRecord(filterQuery: FilterQuery<T>, updateQuery: UpdateQuery<T>) {
    return await this.DBSchema.updateOne(filterQuery, updateQuery, {
      returnOriginal: false,
      runValidators: true
    });
  }

  public async CreateNewRecord(document: T) {
    return await this.DBSchema.create(document);
  }
}
