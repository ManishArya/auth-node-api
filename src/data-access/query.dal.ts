import { FilterQuery, Model, PopulateOptions, UpdateQuery } from 'mongoose';
import BaseSchema from '../models/interfaces/base-schema';

export default class QueryDAL<T extends BaseSchema> {
  protected readonly _db: Model<T>;

  constructor(db: Model<T>) {
    this._db = db;
  }

  public async getFilterRecord(filterQuery: FilterQuery<T>) {
    return await this._db.findOne(filterQuery);
  }

  public async getFilterRecordWithAllRefs(filterQuery: FilterQuery<T>, options: PopulateOptions) {
    return await this._db.findOne(filterQuery).populate(options).lean().exec();
  }

  public async getFilterLeanRecord(filterQuery: FilterQuery<T>): Promise<T> {
    return await this._db.findOne(filterQuery).lean();
  }

  public async getNFilterLeanRecords(n: number, filterQuery: FilterQuery<T>) {
    return await this._db.find(filterQuery).lean().limit(n);
  }

  public async getFilterRecords(filterQuery: FilterQuery<T>) {
    return await this._db.find(filterQuery);
  }

  public async getFilterLeanRecords(filterQuery: FilterQuery<T>) {
    return await this._db.find(filterQuery).lean();
  }

  public async getSortedFilterLeanRecords(filterQuery: FilterQuery<T>, sortParams: any) {
    return await this._db.find(filterQuery).sort(sortParams).lean();
  }

  public async getRecords() {
    return await this._db.find();
  }

  public async findAndDeleteRecord(filterQuery: FilterQuery<T>) {
    return await this._db.findOneAndDelete(filterQuery);
  }

  public async isRecordExists(filterQuery: FilterQuery<T>) {
    return await this._db.exists(filterQuery);
  }

  public async saveRecord(record: Partial<T>) {
    const db = new this._db(record);
    return await db.save();
  }

  public async findAndUpdateLeanRecord(filterQuery: FilterQuery<T>, updateQuery: UpdateQuery<T>) {
    return await this._db
      .findOneAndUpdate(filterQuery, updateQuery, {
        returnOriginal: false,
        runValidators: true
      })
      .lean();
  }

  public async updateRecord(filterQuery: FilterQuery<T>, updateQuery: UpdateQuery<T>) {
    return await this._db.updateOne(filterQuery, updateQuery, {
      returnOriginal: false,
      runValidators: true
    });
  }

  public async deleteRecord(filterQuery: FilterQuery<T>, isLean: boolean = true) {
    return await this._db.deleteOne(filterQuery, { lean: isLean });
  }

  public async createNewRecord(document: T) {
    return await this._db.create(document);
  }

  public async getRecordCount() {
    return await this._db.count();
  }
}
