# human-format

[![Build Status](https://img.shields.io/travis/JsCommunity/human-format/master.svg)](http://travis-ci.org/JsCommunity/human-format)
[![Dependency Status](https://david-dm.org/JsCommunity/human-format/status.svg?theme=shields.io)](https://david-dm.org/JsCommunity/human-format)
[![devDependency Status](https://david-dm.org/JsCommunity/human-format/dev-status.svg?theme=shields.io)](https://david-dm.org/JsCommunity/human-format#info=devDependencies)

> Converts a number to/from a human readable string: `1337` ↔ `1.34kB`


## Installation

### Node & [Browserify](http://browserify.org/)/[Webpack](https://webpack.js.org/)

Installation of the [npm package](https://npmjs.org/package/human-format):

```
> npm install --save human-format
```

Then require the package:

```javascript
var humanFormat = require('human-format');
```

### Browser

You can directly use the build provided at [unpkg.com](https://unpkg.com/human-format/):

```html
<script src="https://unpkg.com/human-format@0.10/index.js"></script>
```

## Usage

### Formatting

```javascript
humanFormat(1337)
//=> '1.34 k'

// The number of decimals can be changed.
humanFormat(1337, {
  decimals: 1
})
//=> '1.3 k'

// Units and scales can be specified.
humanFormat(65536, {
  scale: 'binary',
  unit: 'B'
})
//=> 64 kiB

// There is a helper for this.
humanFormat.bytes(65536)
//=> 64 kiB

// A custom separator can be specified.
humanFormat(1337, {
  separator: ' - '
})
//=> 1.34 - k

// Custom scales can be created!
var timeScale = new humanFormat.Scale({
  seconds: 1,
  minutes: 60,
  hours: 3600,
  days: 86400,
  months: 2592000,
})
humanFormat(26729235, { scale: timeScale })
//=> 10.31 months

// You can force a prefix to be used.
humanFormat(100, { unit: 'm', prefix: 'k' })
//=> 0.1 km

// You can access the raw result.
humanFormat.raw(100, { prefix: 'k' })
//=> {
//   prefix: 'k',
//   value: 0.09999999999999999 // Close value, not rounded.
// }
```

### Parsing

```javascript
humanFormat.parse('1.34 kiB', { scale: 'binary' })
//=> 1372.16

// Fallbacks when possible if the prefix is incorrectly cased.
humanFormat.parse('1 g')
// => 1000000000

// You can access the raw result.
humanFormat.parse.raw('1.34 kB')
//=> {
//  factor: 1000,
//  prefix: 'k',
//  unit: 'B',
//  value: 1.34
//}
```

## Contributions

Contributions are *very* welcomed, either on the documentation or on
the code.

You may:

- report any [issue](https://github.com/JsCommunity/human-format/issues)
  you've encountered;
- fork and create a pull request.

Contributors:

- @djulien
- @qrohlf
- @Itay289
- @sweetpi

## License

ISC © [Julien Fontanet](http://julien.isonoe.net)
