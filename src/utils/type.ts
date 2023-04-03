import { QueryResolvers } from 'scannarr';

export type Impossible<K extends keyof any> = {
  [P in K]: never;
};
export type NoExtraProperties<T, U extends T = T> = U & Impossible<Exclude<keyof U, keyof T>>;

export type MediaParams = Parameters<Extract<QueryResolvers['Media'], Function>>
