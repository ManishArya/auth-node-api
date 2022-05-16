import { FilterQuery, Model, UpdateQuery } from 'mongoose';

export abstract class QueryDAL<T> {
  protected abstract readonly DBSchema: Model<T>;

  public async GetSingleRecord(filterQuery: FilterQuery<T>) {
    return await this.DBSchema.findOne(filterQuery);
  }

  public async GetLeanSingleRecord(filterQuery: FilterQuery<T>) {
    return await this.DBSchema.findOne(filterQuery).lean();
  }

  public async GetAllRecords() {
    return await this.DBSchema.find();
  }

  public async DeleteRecord(filterQuery: FilterQuery<T>) {
    return await this.DBSchema.findOneAndDelete(filterQuery);
  }

  public async CheckRecordExists(filterQuery: FilterQuery<T>) {
    return await this.DBSchema.exists(filterQuery);
  }

  public async SaveRecord(record: any) {
    const newDbSchema = new this.DBSchema(record);
    return (await newDbSchema.save()) as unknown as T;
  }

  public async UpdateRecord(filterQuery: FilterQuery<T>, updateQuery: UpdateQuery<T>) {
    return await this.DBSchema.findOneAndUpdate(filterQuery, updateQuery, {
      returnOriginal: false,
      runValidators: true
    });
  }
}
