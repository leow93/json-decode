declare module 'json-decode' {
  export type Decoder<T> = (json: any) => T;

  export class DecoderError extends Error {}

  export function array<T>(decoder: Decoder<T>): Decoder<T[]>;

  export function bigint(json: any): bigint;

  export function bool(json: any): boolean;

  export function int(json: any): number;

  export function field<K extends string, T>(
    key: K,
    decode: Decoder<T>,
  ): Decoder<T>;

  export function number(json: any): number;

  export function float(json: any): number;

  export function nullable<T>(decoder: Decoder<T>): Decoder<T | null>;

  export function optional<T>(decoder: Decoder<T>): Decoder<T | undefined>;

  export function string(json: any): string;
}
