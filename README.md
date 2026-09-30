# Continuity Passport

Could someone else run your production tomorrow?

Continuity Passport scans a public GitHub repository and turns the operational evidence it can find into a portable production handover record.

It checks for documented deployment, environment configuration, CI/CD, tests, monitoring, backups and recovery, database/schema evidence, ownership, architecture, release/rollback guidance, runtime metadata, and common external dependencies.

> A repository scan is evidence about the codebase, not proof that production is configured correctly.

## What it does

- Accepts a public GitHub repository URL.
- Reads public repository metadata, the file tree, and a smart subset of relevant files.
- Produces a deterministic continuity score based on observable repository evidence.
- Separates evidence found, evidence not found, and items that need confirmation.
- Generates a Continuity Manifest that can be edited and exported.
- Exports a Markdown report and machine-readable JSON.
- Provides a starter GitHub Action for repeatable continuity checks.

## What it does not do

Continuity Passport does not log into GitHub, access private repositories, inspect cloud dashboards, validate live infrastructure, retrieve secrets, or prove that a documented production dependency is actually configured.

Large repositories can also be limited by GitHub's public API tree responses and rate limits. The scanner reports those limitations instead of pretending it inspected everything.

## Local development

Requirements:

- Node.js 20+
- npm

Install and run:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Build for production:

```bash
npm run build
npm start
```

## Project structure

- `app/` — Next.js application routes
- `components/` — shared UI components
- `lib/scanner.ts` — deterministic GitHub scanner and report generation
- `public/continuity-action.yml` — starter GitHub Action
- `SECURITY.md` — security reporting policy
- `CONTRIBUTING.md` — contribution workflow

## Privacy

Scanning is local-first. The browser requests public GitHub API resources directly. The application does not require GitHub credentials or a server-side GitHub token.

Recent scan results are stored locally in the browser so the report can be reopened on the same device.

## License

Released under the MIT License. See [LICENSE](LICENSE).

## Project status

Continuity Passport is an open-source project under active development. Treat scan results as operational evidence and verify critical production assumptions independently.
