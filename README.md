# Continuity Passport

**Could someone else run your production tomorrow?**

Continuity Passport turns a public GitHub repository into a portable **Production Continuity Passport**: an evidence-based handover record showing what the codebase documents about deployment, recovery, ownership, dependencies, and operational readiness.

> **Important:** A repository scan is evidence about the codebase, not proof that production is configured correctly.

## Why Continuity Passport?

Production knowledge often lives across README files, deployment configs, CI workflows, environment documentation, migration files, runbooks, and a few people's heads.

Continuity Passport brings the repository evidence together so a developer, founder, CTO, or incoming maintainer can see what is documented — and what still needs confirmation.

## What it checks

The scanner looks for evidence such as:

- deployment and hosting configuration
- environment variables and `.env.example` documentation
- CI/CD and GitHub Actions
- tests and test infrastructure
- health checks, monitoring, and observability
- backup and restore guidance
- database migrations and schema evidence
- runtime versions and lockfiles
- ownership and `CODEOWNERS`
- architecture and system documentation
- release and rollback procedures
- production URLs and documented domains
- external services such as payments, authentication, email, storage, and databases

Results distinguish between **evidence found**, **evidence not found**, and **needs confirmation**.

## What you get

A generated passport includes:

- an overall continuity status
- a deterministic evidence score
- documented operational capabilities
- missing or unclear areas
- critical dependencies
- ownership and handover information
- deployment and recovery evidence
- a verification checklist
- the files inspected
- an editable Continuity Manifest
- Markdown and JSON exports

## How it works

1. Enter a public GitHub repository URL.
2. Continuity Passport reads public repository metadata, the tree, and a targeted subset of relevant files.
3. Deterministic scanner rules classify the evidence.
4. The report turns those findings into a practical handover record.

No GitHub login or repository secrets are required for a public repository.

## Important limitations

Continuity Passport does **not**:

- access private repositories
- retrieve secrets or credentials
- inspect your cloud provider dashboard
- verify live infrastructure
- prove that a deployment configuration is active
- prove that backups actually work
- prove that documented production dependencies are correctly configured

GitHub API limits can also restrict inspection of very large repositories. When that happens, the scanner reports the limitation rather than implying complete coverage.

## Privacy

Scanning is local-first. Public GitHub resources are requested directly from the browser, and recent scan results are stored locally on the device so a report can be reopened.

No server-side GitHub token is required for the public-repository scanner.

## Documentation and contributing

- [Documentation](app/docs/page.tsx)
- [Contributing](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Support](SUPPORT.md)

## Project status

Continuity Passport is an open-source project under active development.

If you find a scanner rule that produces misleading evidence, please report it with a reproducible public repository example. The project favors transparent, deterministic evidence over assumptions.

## License

Continuity Passport is available under the [MIT License](LICENSE).
