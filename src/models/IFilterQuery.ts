export default interface IFilterQuery<T> {
  operators?: string | string[];
  document?: T;
}
