# human-format

[![CI](https://github.com/JsCommunity/human-format/actions/workflows/ci.yml/badge.svg)](https://github.com/JsCommunity/human-format/actions/workflows/ci.yml)

> Converts a number to/from a human readable string: `1337` ↔ `1.34 kB`

- Formats and parses
- SI, binary and custom scales, with configurable decimals and rounding
- No dependencies, a single ES5 file: Node ≥4 and any browser
- TypeScript types included

## Installation

### npm

Installation of the [npm package](https://npmjs.org/package/human-format):

```
> npm install human-format
```

Then require the package:

```javascript
var humanFormat = require("human-format");
```

TypeScript types are included.

### Browser

You can directly use the build provided at [unpkg.com](https://unpkg.com/human-format/):

```html
<script src="https://unpkg.com/human-format@1/index.js"></script>
```

## Usage

### Formatting

```javascript
humanFormat(1337);
//=> '1.34 k'

// The maximum number of decimals can be changed.
humanFormat(1337, {
  maxDecimals: 1,
});
//=> '1.3 k'

// maxDecimals can be set to auto, so that there is 1 decimal between -10 and 10 excluded and none out of this interval.
humanFormat(1337, {
  maxDecimals: "auto",
});
//=> '1.3 k'

humanFormat(13337, {
  maxDecimals: "auto",
});
//=> '13 k'

// Values are rounded to the nearest by default, but can be rounded down (floor)
// or up (ceil) instead.
humanFormat(1390, {
  maxDecimals: 1,
  rounding: "floor",
});
//=> '1.3 k'

// A fixed number of decimals can be set.
humanFormat(1337, {
  decimals: 4,
});
//=> '1.3370 k'

// Units and scales can be specified.
humanFormat(65536, {
  scale: "binary",
  unit: "B",
});
//=> 64 KiB

// There is a helper for this, which accepts the same options.
humanFormat.bytes(65536);
//=> 64 KiB

// Use the SI scale for multiples of 1000.
humanFormat.bytes(1500, { scale: "SI" });
//=> 1.5 kB

// A custom separator can be specified.
humanFormat(1337, {
  separator: " - ",
});
//=> 1.34 - k

// Custom scales can be created!
var timeScale = new humanFormat.Scale({
  seconds: 1,
  minutes: 60,
  hours: 3600,
  days: 86400,
  months: 2592000,
});
humanFormat(26729235, { scale: timeScale });
//=> 10.31 months

// Helper when the scale is regular, i.e. prefixes are powers of a constant factor
var binaryScale = humanFormat.Scale.create(["", "Ki", "Mi", "Gi", "Ti"], 1024);
humanFormat(173559053, { scale: binaryScale });
//=> 165.52 Mi

// You can force a prefix to be used.
humanFormat(100, { unit: "m", prefix: "k" });
//=> 0.1 km

// You can access the raw result.
humanFormat.raw(100, { prefix: "k" });
//=> {
//   prefix: 'k',
//   value: 0.1
// }
```

### Parsing

```javascript
humanFormat.parse("1.34 KiB", { scale: "binary" });
//=> 1372.16

// Fallbacks when possible if the prefix is incorrectly cased.
humanFormat.parse("1 g");
// => 1000000000

// Exponent notation is supported.
humanFormat.parse("1.5e3 k");
// => 1500000

// If a unit is specified, it is optional but no other unit is accepted.
humanFormat.parse("1 km", { unit: "m" });
// => 1000
humanFormat.parse("5 apples", { unit: "B" });
// throws Error: cannot parse str

// Strict mode rejects incorrectly cased prefixes.
humanFormat.parse("1 g", { strict: true });
// throws Error: cannot parse str

// You can access the raw result.
humanFormat.parse.raw("1.34 kB");
//=> {
//  factor: 1000,
//  prefix: 'k',
//  unit: 'B',
//  value: 1.34
//}
```

### Options

| Option        | Default                           | Description                                                                    |
| ------------- | --------------------------------- | ------------------------------------------------------------------------------ |
| `maxDecimals` | `2` (none for `raw()`)            | Maximum number of decimals, or `"auto"`                                        |
| `decimals`    |                                   | Fixed number of decimals, overrides `maxDecimals`                              |
| `rounding`    | `"round"`                         | `"round"`, `"floor"` or `"ceil"`                                               |
| `separator`   | `" "`                             | Between the value and the prefix+unit                                          |
| `unit`        | `""` (`"B"` for `bytes()`)        | Appended when formatting; when parsing, optional but no other unit is accepted |
| `scale`       | `"SI"` (`"binary"` for `bytes()`) | `"SI"`, `"binary"` or a `Scale`                                                |
| `prefix`      |                                   | Forces this prefix when formatting                                             |
| `strict`      | `false`                           | When parsing, rejects incorrectly cased prefixes                               |

Errors:

- `TypeError` if the value to format is not a number, or the string to parse is not a string
- `Error` with the message `missing scale`, `invalid prefix`, `invalid rounding` or `cannot parse str`

## Contributions

Contributions are _very_ welcomed, either on the documentation or on
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
