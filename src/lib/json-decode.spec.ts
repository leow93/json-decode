import { describe, it, expect } from 'vitest';
import {
  array,
  bigint,
  bool,
  Decoder,
  DecoderError, enumerator,
  field,
  float,
  int,
  nullable,
  number,
  optional,
  string
} from "./json-decode";

describe('bool', () => {
  it('decodes a boolean', () => {
    expect(bool(true)).toEqual(true);
  });

  it('throws for a non-boolean', function () {
    expect(() => bool(9)).toThrow(DecoderError);
  });
});

describe('string', () => {
  it('decodes a string', () => {
    expect(string('abc')).toEqual('abc');
  });

  it('throws for a non-string', function () {
    expect(() => string(false)).toThrow(DecoderError);
  });
});

describe('number', () => {
  it('decodes a number', () => {
    expect(number(8)).toEqual(8);
  });

  it('throws for a non-number', function () {
    expect(() => number(false)).toThrow(DecoderError);
  });
});
describe('int', () => {
  it('decodes an int', () => {
    expect(int(8)).toEqual(8);
  });

  it('throws for a non-int', function () {
    expect(() => int(1.4)).toThrow(DecoderError);
  });
});

describe('float', () => {
  it('decodes an float', () => {
    expect(float(1.8)).toEqual(1.8);
  });

  it('throws for a non-float', function () {
    expect(() => float(12)).toThrow(DecoderError);
  });
});

describe('bigint', () => {
  it('decodes an bigint', () => {
    expect(bigint(112n)).toEqual(112n);
  });

  it('throws for a non-bigint', function () {
    expect(() => bigint(12)).toThrow(DecoderError);
  });
});

describe('array', () => {
  it('decodes an array of ints', () => {
    expect(array(int)([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('throws when not an array', () => {
    expect(() => array(int)(false)).toThrow(DecoderError);
  });

  it('throws when one item is not decodable', () => {
    expect(() => array(int)([1, '2', 3])).toThrow(DecoderError);
  });
});

describe('field', () => {
  it('decodes a string property', () => {
    expect(field('foo', string)({ foo: 'bar' })).toEqual('bar');
  });

  it('throws when it cannot decode', () => {
    expect(() => field('foo', string)({ foo: true })).toThrowError(
      DecoderError,
    );
  });
});

describe('optional', () => {
  it('decodes the field when it exists', () => {
    expect(optional(field('foo', int))({ foo: 1 })).toEqual(1);
  });
  it('returns undefined when the field does not exist', () => {
    expect(optional(field('bar', int))({ foo: 1 })).toEqual(undefined);
  });
  it('returns undefined when the field exists but cannot be decoded', () => {
    expect(optional(field('foo', string))({ foo: 1 })).toEqual(undefined);
  });
});

describe('nullable', () => {
  it('decodes as null when the field is null', () => {
    expect(nullable(string)(null)).toBeNull();
  });

  it('decodes as the value when not null', () => {
    expect(nullable(string)('abcd')).toBe('abcd');
  });

  it('throws when the value is not the expected type', () => {
    expect(() => nullable(string)(123)).toThrowError(DecoderError);
  });
});

describe('enumerator', () => {

  describe('when the enum is a string enum', () => {
    enum Choice {
      carrot = 'carrot',
      stick = 'stick'
    }

    it('decodes the enum', () => {
      expect(enumerator(Choice)('carrot')).toEqual(Choice.carrot);
    });

    it('throws when the value is not a member of the enum', () => {
      expect(() => enumerator(Choice)('banana')).toThrowError(DecoderError);
    });
  });

  describe('when the enum is a numeric enum', () => {
    enum Choice {
      carrot = 0,
      stick =1
    }

    it('decodes the enum', () => {
      expect(enumerator(Choice)('carrot')).toEqual(Choice.carrot);
    });

    it('throws when the value is not a member of the enum', () => {
      expect(() => enumerator(Choice)('banana')).toThrowError(DecoderError);
    });
  });


  describe('when the enum has no values assigned', () => {
    enum Choice {
      carrot ,
      stick
    }

    it('decodes the enum', () => {
      expect(enumerator(Choice)('carrot')).toEqual(Choice.carrot);
    });

    it('throws when the value is not a member of the enum', () => {
      expect(() => enumerator(Choice)('banana')).toThrowError(DecoderError);
    });
  });
})

describe('decoding a complex object', () => {
  type Blob = {
    name: string;
    age: number;
    favouriteNumbers: number[];
    favouriteColour: string | null;
    favouriteFood: {
      type: string;
      flavour: string;
    };
  };

  const favouriteFoodDecoder: Decoder<Blob['favouriteFood']> = (json) => ({
    type: field('type', string)(json),
    flavour: field('flavour', string)(json),
  });
  const decoder: Decoder<Blob> = (json) => ({
    name: field('name', string)(json),
    age: field('age', int)(json),
    favouriteNumbers: field('favouriteNumbers', array(int))(json),
    favouriteColour: field('favouriteColour', nullable(string))(json),
    favouriteFood: field('favouriteFood', favouriteFoodDecoder)(json),
  });
  it('decodes the object', () => {
    const blob: Blob = {
      name: 'Bob',
      age: 42,
      favouriteNumbers: [1, 2, 3],
      favouriteColour: null,
      favouriteFood: { type: 'pizza', flavour: 'pepperoni' },
    };

    expect(decoder(blob)).toEqual(blob);
  });

  it('fails to decode an improper object', () => {
    const blob = {
      name: 'Bob',
      age: 42,
      favouriteNumbers: [1, 2, '3'],
      favouriteColour: null,
      favouriteFood: { type: 'pizza', flavour: 'pepperoni' },
    };
    expect(() => decoder(blob)).toThrowError(DecoderError);
  });
});
