# human-format

[![Build Status](https://img.shields.io/travis/julien-f/human-format/master.svg)](http://travis-ci.org/julien-f/human-format)
[![Dependency Status](https://david-dm.org/julien-f/human-format/status.svg?theme=shields.io)](https://david-dm.org/julien-f/human-format)
[![devDependency Status](https://david-dm.org/julien-f/human-format/dev-status.svg?theme=shields.io)](https://david-dm.org/julien-f/human-format#info=devDependencies)

> Converts a number to/from a human readable string: `1337` ↔ `1.34kB`


## Install

Download [manually](https://github.com/julien-f/human-format/releases) or with package-manager.

#### [npm](https://npmjs.org/package/human-format)

```
npm install --save human-format
```

#### bower

```
bower install --save human-format
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

// A custom seperator can be specified.
humanFormat(1337, {
  seperator: ' - '
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

- report any [issue](https://github.com/julien-f/human-format/issues)
  you've encountered;
- fork and create a pull request.

Contributors:

- @sweetpi
- @Itay289
- @qrohlf

## License

ISC © [Julien Fontanet](http://julien.isonoe.net)
