import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import IBaseSchema from '../models/IBaseSchema';

export default class QueryDAL<T extends IBaseSchema> {
  protected readonly DBSchema: Model<T>;

  constructor(schema: any) {
    this.DBSchema = schema;
  }

  public async GetSingleRecord(filterQuery: FilterQuery<T>) {
    return await this.DBSchema.findOne(filterQuery);
  }

  public async GetLeanSingleRecord(filterQuery: FilterQuery<T>): Promise<T> {
    return await this.DBSchema.findOne(filterQuery).lean();
  }

  public async GetNRecords(n: number, filterQuery: FilterQuery<T>) {
    return await this.DBSchema.find(filterQuery).lean().limit(n);
  }

  public async GetRecordsWithFilter(filterQuery: FilterQuery<T>) {
    return await this.DBSchema.find(filterQuery);
  }

  public async GetAllRecords() {
    return await this.DBSchema.find();
  }

  public async Delete(filterQuery: FilterQuery<T>) {
    return await this.DBSchema.findOneAndDelete(filterQuery);
  }

  public async CheckRecordExists(filterQuery: FilterQuery<T>) {
    return await this.DBSchema.exists(filterQuery);
  }

  public async Save(record: T) {
    const newDbSchema = new this.DBSchema(record);
    return (await newDbSchema.save()) as unknown as T;
  }

  public async FindAndUpdate(filterQuery: FilterQuery<T>, updateQuery: UpdateQuery<T>) {
    return await this.DBSchema.findOneAndUpdate(filterQuery, updateQuery, {
      returnOriginal: false,
      runValidators: true
    });
  }

  public async Update(filterQuery: FilterQuery<T>, updateQuery: UpdateQuery<T>) {
    return await this.DBSchema.updateOne(filterQuery, updateQuery, {
      returnOriginal: false,
      runValidators: true
    });
  }

  public async Create(document: T) {
    return await this.DBSchema.create(document);
  }
}
