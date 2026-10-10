# CLAUDE.md

## Project context

- **Stack**: plain JavaScript (ES5, UMD), no runtime dependencies, npm. Types are hand-written in `index.d.ts`.
- **Layout**: `index.js` (all code), `index.d.ts` (types), `index.spec.js` (tests), `index.test-d.ts` (type tests), `README.md` (API docs). Only `index.js` and `index.d.ts` are published.
- **Setup**: `npm ci` (also installs the husky hook).
- **Build**: none. `index.js` is published as-is; its UMD wrapper also serves browsers via unpkg.
- **Test**: `npm test` (about 2s, no network or I/O): `node:test`, then tsd for the types. Single test: `node --test --test-name-pattern=<regex> index.spec.js`. Watch mode: `npm run dev-test`.
- **Lint/format**: `npx eslint .` and `npx prettier --write <files>`.

## Code conventions

- **Compatibility**: ES5 syntax only (`var`, `function`, no arrow functions, classes or template literals). ESLint enforces it with `ecmaVersion: 5`. The code must keep working in browsers via the UMD wrapper and on Node ≥4 (`engines`).
- **Tests**: `node:test` (`describe`/`it` + `assert`) in `index.spec.js`. Every behavior change needs a case there. Parse/format round trips go in the shared `data` table.
- **Public API**: any change to options or exports updates `index.d.ts`, `index.test-d.ts` and `README.md` in the same commit.

## Pitfalls

- `npm test` enforces 100% coverage (lines, branches, functions). Code unreachable in Node goes between `/* node:coverage disable */` and `/* node:coverage enable */`, with a reason.
- `npm test` ends with `&& true` so that lint-staged's appended file paths end up as arguments to `true`, and the full suite runs on every commit. Don't "simplify" it.

## Git workflow

- **Message format**: Conventional Commits with an optional scope, e.g. `feat(types): …`, `chore(README): …`, `chore: update dev deps`. Release commits are the bare version, created by `npm version`.
- **Branching**: maintainers push chores directly to `master`. External contributions come in as PRs and are squash-merged (`… (#54)`).
- **Ask first**: `npm version` and `npm publish`.
- **Reformat-only commits**: add their full SHA to `.git-blame-ignore-revs` (GitHub uses it; locally: `git config blame.ignoreRevsFile .git-blame-ignore-revs`).

## Development workflow

- Changelog: `CHANGELOG.md` under `## [Unreleased]` in [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format, in the same commit as the code.
- Git hook: `pre-commit` runs lint-staged, which runs the full test suite plus prettier and eslint on staged files. `npm ci` reinstalls it.
- CI: GitHub Actions (`.github/workflows/ci.yml`) runs `npm test` and `npx eslint .` on Node 22 and 24 for pushes to `master` and PRs.
