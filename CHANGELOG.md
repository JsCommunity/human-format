# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Changes up to 1.2.1 are recorded in the git history only.

## [Unreleased]

### Changed

- Formatting is about twice as fast: options are no longer copied on each call.

## [1.3.0] - 2026-10-10

### Added

- `rounding` option: `"round"` (default), `"floor"` or `"ceil"`, e.g. to never display a value above the input ([#46](https://github.com/JsCommunity/human-format/issues/46)).

### Fixed

- Works in ES5 environments without `Number.isNaN` (e.g. Internet Explorer).
- `parse()` reads exponent notation as part of the number (`1e3` gave `1e18`, `e` being exa), rejects digits after the prefix (`1k5`), and with the `unit` option, rejects any other unit (`5 apples`). The parsed unit no longer includes trailing spaces ([#57](https://github.com/JsCommunity/human-format/issues/57)).
- `parse()` avoids some floating point errors, e.g. `8.3M` gives `8300000` instead of `8300000.000000001` ([#29](https://github.com/JsCommunity/human-format/issues/29)).
- `decimals` switches to the next prefix when rounding reaches it, e.g. `999999` gives `1 M` instead of `1000 k` ([#56](https://github.com/JsCommunity/human-format/issues/56)).
- `parse()` accepts an incorrectly cased prefix whose lowercase form is a prefix itself, e.g. `100K` ([#31](https://github.com/JsCommunity/human-format/issues/31)).
- Types: `index.d.ts` no longer fails to compile without `skipLibCheck` (`export =` mixed with other exports).
- Types: without `scale`, prefixes are checked against the SI scale (binary for `bytes()`) instead of accepting any string.
- Types: `Scale#parse()` returns the scale's prefixes, or `undefined` when the string does not match.
- Types: `parse.raw()` takes an options object, like at runtime, instead of a `strict` boolean.
