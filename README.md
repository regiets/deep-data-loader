# deep-data-loader

DeepDataLoader is a utility class that allows the batching and caching of requests across two levels.

## Get Started

Install DeepDataLoader using npm.

```sh
npm install --save deep-data-loader
```

Create a `DeepDataLoader` instance, passing in an array of primary keys and optionally an array of secondary keys.

```js
const DeepDataLoader = require('deep-data-loader);

const userLoader = new DeepDataLoader((primaryKeys, secondaryKeys) => batchLoadFn(primaryKeys, secondaryKeys));
```

Each instance of the `DeepDataLoader` class represents a unique cache. This cache can be initialised once per app or once per request.

⚠️ If the cache is initialised per application, it may lead to an unintended memory leak.

The keys of the `batchLoadFn` should be supplies as arrays of any type. Using structural types (non-primitive types) such as objects or arrays is possible but matching is done by reference (remember `{a: 1} !== {a: 1}`).
