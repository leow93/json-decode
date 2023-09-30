export type Decoder<T> = (json: any) => T;

export class DecoderError extends Error {
}

export function array<T>(decoder: Decoder<T>): Decoder<T[]>;

export const bigint: Decoder<bigint>;

export const bool: Decoder<boolean>;

export const int: Decoder<number>;

export function field<K extends string, T>(
  key: K,
  decode: Decoder<T>
): Decoder<T>;

export const number: Decoder<number>;

export const float: Decoder<number>;

export function nullable<T>(decoder: Decoder<T>): Decoder<T | null>;

export function optional<T>(decoder: Decoder<T>): Decoder<T | undefined>;

export const string: Decoder<string>;
