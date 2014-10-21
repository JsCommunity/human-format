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

## Example

```javascript
humanFormat(1337);
//=> '1.34kB'

// Custom units can be used.
humanFormat(65536, { unit: 'm' });
//=> 65.54km

// Custom prefixes with custom bases can be used!
humanFormat(3452466511216.64, {
	prefixes: humanFormat.makePrefixes(
		// Array of consecutive prefix.
		',ki,Mi,Gi,Ti,Pi'.split(','),

		// Base.
		1024
	)
});
//=> 3.14TiB

// You can force a prefix to be used.
humanFormat(100, { unit: 'm', prefix: 'k' });
//=> 0.1km

// You can access the raw result.
humanFormat.raw(100, { unit: 'm', prefix: 'k' });
//=> {
//   num: 0.09999999999999999, // Close value, not rounded.
//   prefix: 'k',
//   num: 'm',
// }

// You can also parses a human readable string.
humanFormat.parse('1.34kB');
//=> 1372.16
```

## Contributions

Contributions are *very* welcomed, either on the documentation or on
the code.

You may:

- report any [issue](https://github.com/julien-f/human-format/issues)
  you've encountered;
- fork and create a pull request.

## License

ISC © [Julien Fontanet](http://julien.isonoe.net)
