# Contributing

Thanks for helping with keylab.

## Setup

The project uses Bun 1.2.11, pinned in `package.json`.

```bash
bun install --frozen-lockfile
```

## Checks

```bash
bun run test
bun run lint
bun run build
```

`bun run test-with-coverage` writes the coverage report and updates `badges/coverage.svg` when you also run `bun run coverage:badge`.

Format with `bun run format` before opening a pull request.

## Pull requests

- Keep the published API compatible within the current major version.
- Add or update tests for behavior you change.
- Update the matching page under `docs/` when caller-visible behavior changes.
- Planning notes for larger changes live under `specs/`.
- Do not log secrets, tokens, or private keys.

## Conduct and security

This project follows the [Code of Conduct](CODE_OF_CONDUCT.md). Report security issues privately, as described in [SECURITY.md](SECURITY.md).
