# Security Policy

## Supported versions

Security fixes are generally applied to the latest version on the `main` branch. Older releases may not receive security fixes.

## Reporting a vulnerability

Please do **not** open a public GitHub issue for a suspected security vulnerability.

Use GitHub's private **Security Advisories** feature for this repository when available:

1. Open the repository's **Security** tab.
2. Choose **Report a vulnerability**.
3. Include the affected version or commit, reproduction steps, impact, and any relevant logs or proof-of-concept material.

If private reporting is unavailable, contact the repository maintainer through their GitHub profile and avoid publishing exploit details until a fix or mitigation is available.

## What to include

A useful report includes:

- affected route, component, dependency, or configuration
- exact reproduction steps
- expected and observed behavior
- security impact
- minimal proof of concept where safe
- proposed mitigation, if known

Please give maintainers reasonable time to investigate and release a fix before public disclosure.

## Secrets

Never commit API keys, access tokens, passwords, private keys, production credentials, or real environment files. Use placeholders such as `.env.example` for documentation.

## Scope

This policy covers the Continuity Passport source code and the public application maintained in this repository. Third-party services such as GitHub and Vercel have their own security reporting processes.
