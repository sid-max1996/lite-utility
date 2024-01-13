export type ExcludeMatchingProperties<T, V> = Pick<T, { [K in keyof T]-?: T[K] extends V ? never : K }[keyof T]>;

export type ReplaceKeyTypes<Type, OldKeyType, NewKeyType> = {
  [Key in keyof Type]: Type[Key] extends OldKeyType ? NewKeyType : Type[Key];
};

export type ValueOf<T> = T[keyof T];
