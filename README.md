# json-decode

## 

json-decode is a small library built to help decode unknown data into known types.

The concept of serialisation/deserialisation is baked into many real languages but unfortunately not into JavaScript.
This often leads to us developers making the assumption in our code that when receiving data across a boundary, it _will_ have the shape we expect.

json-decode exists to help us validate those assumptions at runtime.

## Installation


#### With pnpm
```shell
pnpm install json-decode
```

#### With yarn 
```shell
yarn install json-decode
```

#### With npm
```shell
npm install json-decode
```

## Usage 

### Decoding a string
```typescript
import { string } from "json-decode";

string('hello world'); // 'hello world'
string(1); // throws a DecodeError
```
You'll find the same behaviour for all of the primitive decoders.


### Decoding an object
Let's imagine we have an API request to fetch a book and we need to deserialise it.

```typescript
import { Decoder, field, number, string } from "json-decode";

type Book = {
  id: number;
  title: string;
  author: string;
};

const decodeBook: Decoder<Book> = json => ({
  id: field('name', number)(json),
  title: field('title', string)(json),
  author: field('author', string)(json),
})

function getBook(): Promise<Book> {
  return fetch('https://example.com/book/1')
    .then((response) => response.json())
    .then((json) => decodeBook(json));
}
```

Once again, it's worth noting that this will throw an error if the data doesn't match the shape we expect.
In that case, you have a couple of options at your disposal:
1. Catch the `DecodeError` and handle it however you see fit:

```typescript
import { DecodeError } from "json-decode"; 

try {
  decodeBook(json); 
} catch (error) {
  if (error instanceof DecodeError) {
    // handle the error 
  } else {
    // is this even a book?
  }
}
```

2. Make use of the `nullable` decoder, like so:

```typescript
import { Decoder, field, number, string, nullable } from "json-decode";


const decodeBook: Decoder<Book> = json => ({
  id: field("name", number)(json),
  title: field("title", string)(json),
  author: field("author", string)(json)
});

// This will return `null` if the data cannot be decoded into a `Book`
const decodeNullableBook: Decoder<Book | null> = nullable(decodeBook);
```

### Decoding an object with an optional property
In this example we extend the book type to have an optional `publisher` property, containing some other data which we decode.

```typescript
import { Decoder, field, number, string } from "json-decode";

type Publisher = {
  id: bigint;
  name: string;
  address?: string;
};
type Book = {
  id: number;
  title: string;
  author: string;
  publisher?: Publisher
};

const decodePublisher: Decoder<Publisher> = (json) => ({
  id: field('id', bigint)(json),
  name: field('name', string)(json),
  address: optional(field('address', string))(json),
});

const decodeBook: Decoder<Book> = (json) => ({
  id: field('name', number)(json),
  title: field('title', string)(json),
  author: field('author', string)(json),
  publisher: field('publisher', optional(decodePublisher))(json),
});
```

### Decoding an array

```typescript
import { Decoder, array, field, number, string } from "json-decode";

array(number)([1, 2, 3]); // [1, 2, 3]
array(number)([1, 2, '3']); // throws a DecodeError
```
