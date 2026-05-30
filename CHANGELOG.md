# Changelog

## 0.5.3 - 2026-05-30

- Fixed repository packaging for GitHub installs with `--ignore-scripts`.
- Replaced pnpm-only build scripts with npm-compatible scripts.
- Added `prepack` so `npm pack` always builds `dist/`.
- Added `reflect-metadata` as a runtime dependency.
- Removed the broken `@telepilotco/tdlib-binaries-prebuilt` runtime dependency.
- Committed `dist/` intentionally so n8n can load the nodes from a GitHub install without scripts.
- Updated package metadata to point to `nickovall/n8n-nodes-telepilot`.
- Removed old deploy scaffolding, private-registry snippets, generated logs, and one-off audit reports.
- Removed stale branch references from the repository.
- Hardened `api_id` handling before TDLib sessions and filesystem paths are used.
- Fixed trigger listener cleanup and reduced sensitive debug logging.

## 0.5.2-fork - 2026-05

- Removed the upstream credential test request to `http://ls.telepilot.co:4413`.
- Documented the broken upstream TDLib binary distribution.
- Documented the verified Alpine/musl `libtdjson.so` rebuild hash.

## Upstream

Original project: https://github.com/telepilotco/n8n-nodes-telepilot
