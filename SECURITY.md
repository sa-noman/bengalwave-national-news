# BengalWave Security Policy

## Supported release

The production deployment from the `main` branch at https://bengalwave.news is supported. Old test branches are not production.

## Report a vulnerability privately

Use GitHub's private security advisory reporting for this repository (when available) rather than publishing passwords, access tokens, proof-of-concept exploits, or personal information in public issues:
https://github.com/sa-noman/bengalwave-national-news/security/advisories

Do not conduct destructive testing, brute-force password attempts, or database write experiments against production. Public read-only security checks can be run through the audited GitHub Actions workflows.

## Automated safeguards

- CI typechecking, tests, build, browser CSP/access controls, and desktop/mobile visual regression.
- MFA AAL2 enforcement for CMS Owner and Editor, including database authorization.
- Independent weekly CodeQL JavaScript/TypeScript security analysis, full dependency audit, and credential-free live security boundary checks. A live-site or dependency failure cannot skip static analysis.
- Production probes run only from main; pull requests run static checks and local browser tests.
- Monthly OWASP ZAP passive scan of public routes; missing/malformed reports and high-risk alerts fail the workflow. Medium/low/informational warnings remain in artifacts and require human triage; they do not necessarily indicate exploitable bugs.
- Dependabot dependency and GitHub Action update PRs, reviewed before merging.
- Supabase row-level security and server-only CMS login rate limiting.

## Deployment policy

Never modify article content, image data, public UI, font, CSS, menu, color or dark/light layouts under a security-only PR. Deploy only after checks pass and verify production state after merging.
