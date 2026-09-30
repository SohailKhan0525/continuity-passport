# Contributing to Continuity Passport

Thanks for helping make production handovers more observable and less dependent on tribal knowledge.

## Before you start

Please read:

- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [SECURITY.md](SECURITY.md)

For significant changes, open an issue first so the scope can be discussed before implementation.

## Development

Requirements:

- Node.js 20+
- npm

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

## Pull requests

A good pull request should:

1. Explain the problem being solved.
2. Describe the approach.
3. Keep unrelated changes out of the PR.
4. Include tests or verification steps when behavior changes.
5. Update documentation when user-facing behavior changes.
6. Avoid introducing secrets, credentials, or private data.

## Scanner changes

Continuity Passport intentionally favors deterministic evidence over guesses.

When changing scanner rules:

- state exactly what evidence is detected
- avoid claiming that source inspection proves live production state
- keep GitHub API limitations explicit
- add or update representative test cases when practical
- preserve clear "found / not found / needs confirmation" semantics

## UI changes

Follow the project's design system and accessibility expectations. Verify keyboard focus, loading, empty, error, and responsive states for changed flows.

## Commit messages

Use concise, imperative commit messages, for example:

- `Add rollback evidence rule`
- `Improve scan error state`
- `Document GitHub API limits`

## License

By contributing, you agree that your contributions will be licensed under the repository's MIT License.
