export type Decoder<T> = (json: unknown) => T;

export class DecoderError extends Error {}
export const bool: Decoder<boolean> = (json) => {
  if (typeof json !== 'boolean') {
    throw new DecoderError(`Expected boolean, got ${JSON.stringify(json)}`);
  }

  return json;
};

export const string: Decoder<string> = (json) => {
  if (typeof json !== 'string') {
    throw new DecoderError(`Expected string, got ${JSON.stringify(json)}`);
  }

  return json;
};

export const number: Decoder<number> = (json) => {
  if (typeof json !== 'number') {
    throw new DecoderError(`Expected number, got ${JSON.stringify(json)}`);
  }

  return json;
};

export const int: Decoder<number> = (json) => {
  const x = number(json);

  if (!Number.isInteger(x)) {
    throw new DecoderError(`Expected integer, got ${JSON.stringify(json)}`);
  }
  return x;
};

export const float: Decoder<number> = (json) => {
  const x = number(json);

  if (Number.isInteger(x)) {
    throw new DecoderError(`Expected float, got ${JSON.stringify(json)}`);
  }
  return x;
};

export const bigint: Decoder<bigint> = (json) => {
  if (typeof json !== 'bigint') {
    throw new DecoderError(`Expected bigint, got ${JSON.stringify(json)}`);
  }

  return json;
};
export const array =
  <T>(decoder: Decoder<T>): Decoder<T[]> =>
  (json) => {
    if (!Array.isArray(json)) {
      throw new DecoderError(`Expected array, got ${JSON.stringify(json)}`);
    }
    const length = json.length;
    const result = new Array(length);
    for (let i = 0; i < length; ++i) {
      let value: T;
      try {
        value = decoder(json[i]);
      } catch (e) {
        if (e instanceof DecoderError) {
          throw new DecoderError(e.message + '\n\t at index ' + String(i));
        }
        throw e;
      }
      result[i] = value;
    }
    return result;
  };

export const field =
  <K extends string, T>(key: K, decode: Decoder<T>): Decoder<T> =>
  (json) => {
    if (typeof json === 'object' && !Array.isArray(json) && json != null) {
      const value = (json as any)[key];
      if (key in json) {
        try {
          return decode(value);
        } catch (err) {
          if (err instanceof DecoderError) {
            throw new DecoderError(
              err.message + ("\n\tat field '" + (key + "'")),
            );
          }
          throw err;
        }
      } else {
        throw new DecoderError("Expected field '" + key + "'");
      }
    } else {
      throw new DecoderError('Expected object, got ' + JSON.stringify(json));
    }
  };

export const optional =
  <T>(decoder: Decoder<T>): Decoder<T | undefined> =>
  (json) => {
    try {
      return decoder(json);
    } catch (e) {
      if (e instanceof DecoderError) {
        return undefined;
      }
      throw e;
    }
  };

export const nullable =
  <T>(decoder: Decoder<T>): Decoder<T | null> =>
  (json) =>
    json === null ? json : decoder(json);

export const enumerator = <T>(enumType: T) => (json: unknown): T[keyof T] => {
  const entries = Object.entries(enumType as any);
  const entry = entries.find(([, v]) => v === json);
  if (entry === undefined) {
    throw new DecoderError(`Expected enum value, got ${JSON.stringify(json)}`);
  }
  const value = entry[1];
  if (value === undefined) {
    throw new DecoderError(`Expected enum value, got ${JSON.stringify(json)}`);
  }
  return value as T[keyof T];
}