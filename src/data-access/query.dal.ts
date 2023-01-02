import { FilterQuery, Model, PopulateOptions, UpdateQuery } from 'mongoose';
import BaseSchema from '../models/interfaces/base-schema';

export default class QueryDAL<TSchema extends BaseSchema> {
  protected readonly _db: Model<TSchema>;

  constructor(db: Model<TSchema>) {
    this._db = db;
  }

  public async getFilterRecord(filterQuery: FilterQuery<TSchema>) {
    return await this._db.findOne(filterQuery);
  }

  public async getFilterRecordWithAllRefs(filterQuery: FilterQuery<TSchema>, options: PopulateOptions) {
    return await this._db.findOne(filterQuery).populate(options).lean().exec();
  }

  public async getFilterLeanRecord(filterQuery: FilterQuery<TSchema>): Promise<TSchema> {
    return await this._db.findOne(filterQuery).lean();
  }

  public async getFilterNLeanRecords(n: number, filterQuery: FilterQuery<TSchema>) {
    return await this._db.find(filterQuery).lean().limit(n);
  }

  public async getFilterRecords(filterQuery: FilterQuery<TSchema>) {
    return await this._db.find(filterQuery);
  }

  public async getFilterLeanRecords(filterQuery: FilterQuery<TSchema>) {
    return await this._db.find(filterQuery).lean();
  }

  public async getSortedFilterLeanRecords(filterQuery: FilterQuery<TSchema>, sortParams: any) {
    return await this._db.find(filterQuery).sort(sortParams).lean();
  }

  public async getRecords() {
    return await this._db.find();
  }

  public async findAndDeleteRecord(filterQuery: FilterQuery<TSchema>) {
    return await this._db.findOneAndDelete(filterQuery);
  }

  public async checkRecordExists(filterQuery: FilterQuery<TSchema>) {
    return await this._db.exists(filterQuery);
  }

  public async saveRecord(record: Partial<TSchema>) {
    const db = new this._db(record);
    return await db.save();
  }

  public async findAndUpdateLeanRecord(filterQuery: FilterQuery<TSchema>, updateQuery: UpdateQuery<TSchema>) {
    return await this._db
      .findOneAndUpdate(filterQuery, updateQuery, {
        returnOriginal: false,
        runValidators: true
      })
      .lean();
  }

  public async updateRecord(filterQuery: FilterQuery<TSchema>, updateQuery: UpdateQuery<TSchema>, upsert = false) {
    return await this._db.updateOne(filterQuery, updateQuery, {
      returnOriginal: false,
      runValidators: true,
      upsert
    });
  }

  public async deleteRecord(filterQuery: FilterQuery<TSchema>, isLean: boolean = true) {
    return await this._db.deleteOne(filterQuery, { lean: isLean });
  }

  public async createNewRecord(document: TSchema) {
    return await this._db.create(document);
  }

  public async getRecordCount() {
    return await this._db.count();
  }
}
