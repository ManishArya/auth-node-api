import { FilterQuery, Model, PopulateOptions, UpdateQuery } from 'mongoose';
import BaseSchema from '../models/interfaces/base-schema';

export default class QueryDAL<TSchema extends BaseSchema> {
  protected readonly _db: Model<TSchema>;

  constructor(db: Model<TSchema>) {
    this._db = db;
  }

  public async getFilterRecordAsync(filterQuery: FilterQuery<TSchema>) {
    return await this._db.findOne(filterQuery);
  }

  public async getFilterRecordWithOptionsAsync(filterQuery: FilterQuery<TSchema>, options: PopulateOptions) {
    return await this._db.findOne(filterQuery).populate(options).lean().exec();
  }

  public async getFilterLeanRecordAsync(filterQuery: FilterQuery<TSchema>): Promise<TSchema> {
    return await this._db.findOne(filterQuery).lean();
  }

  public async getFilterNLeanRecordsAsync(n: number, filterQuery: FilterQuery<TSchema>) {
    return await this._db.find(filterQuery).lean().limit(n);
  }

  public async getFilterRecordsAsync(filterQuery: FilterQuery<TSchema>) {
    return await this._db.find(filterQuery);
  }

  public async getFilterLeanRecordsAsync(filterQuery: FilterQuery<TSchema>) {
    return await this._db.find(filterQuery).lean();
  }

  public async getSortedFilterLeanRecordsAsync(filterQuery: FilterQuery<TSchema>, sortParams: any) {
    return await this._db.find(filterQuery).sort(sortParams).lean();
  }

  public async getRecordsAsync() {
    return await this._db.find();
  }

  public async findAndDeleteRecordAsync(filterQuery: FilterQuery<TSchema>) {
    return await this._db.findOneAndDelete(filterQuery);
  }

  public async checkRecordExistsAsync(filterQuery: FilterQuery<TSchema>) {
    return await this._db.exists(filterQuery);
  }

  public async saveRecordAsync(record: Partial<TSchema>) {
    const db = new this._db(record);
    return await db.save();
  }

  public async findAndUpdateLeanRecordAsync(filterQuery: FilterQuery<TSchema>, updateQuery: UpdateQuery<TSchema>) {
    return await this._db
      .findOneAndUpdate(filterQuery, updateQuery, {
        returnOriginal: false,
        runValidators: true
      })
      .lean();
  }

  public async updateRecordAsync(filterQuery: FilterQuery<TSchema>, updateQuery: UpdateQuery<TSchema>, upsert = false) {
    return await this._db.updateOne(filterQuery, updateQuery, {
      returnOriginal: false,
      runValidators: true,
      upsert
    });
  }

  public async deleteRecordAsync(filterQuery: FilterQuery<TSchema>, isLean: boolean = true) {
    return await this._db.deleteOne(filterQuery, { lean: isLean });
  }

  public async createNewRecordAsync(document: TSchema) {
    return await this._db.create(document);
  }

  public async getRecordCountAsync() {
    return await this._db.count();
  }
}
