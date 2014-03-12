# human-format

> Converts a number to/from a human readable string: `1337` ↔ `1.34kB`

## Install

Download [manually](https://github.com/julien-f/human-format/releases) or with package-manager.

#### [npm](https://npmjs.org/package/human-format)

```
npm install --save human-format
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
	unit: 'iB',
	prefixes: humanFormat.makePrefixes(
		',k,M,G,T,P'.split(','),
		1024
	)
});
//=> 3.14TiB

// You can also parses a human readable string.
humanFormat.parse('1.34kB');
//=> 1372.16
```

## License

ISC © [Julien Fontanet](http://julien.isonoe.net)
