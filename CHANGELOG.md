# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Changes up to 1.2.1 are recorded in the git history only.

## [Unreleased]

### Fixed

- Types: `index.d.ts` no longer fails to compile without `skipLibCheck` (`export =` mixed with other exports).
- Types: without `scale`, prefixes are checked against the SI scale (binary for `bytes()`) instead of accepting any string.
- Types: `parse.raw()` takes an options object, like at runtime, instead of a `strict` boolean.
