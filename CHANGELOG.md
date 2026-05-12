# Changelog

## [fork-1.0.0] — 2026-05

### Security

- **Removed** outbound POST to `http://ls.telepilot.co:4413` in the credential test handler
  (`credentials/TelePilotApi.credentials.ts`). The endpoint is vendor-controlled, uses plain HTTP,
  and its purpose is unverified. The `test` block and unused `ICredentialTestRequest` import were
  both removed. Credentials are validated at first use against Telegram MTProto directly.

### Build

- **Rebuilt** `libtdjson.so` from official `tdlib/td` source (commit `66234ae2537a99ec0eaf7b0857245a6e5c2d2bc9`).
  Vendor distribution URL returns HTTP 404 for all variants; original binary is unavailable.
- **Added** glibc build (Ubuntu 20.04 / gcc 9.4.0): SHA256 `0ee03d6e3b49acbb443b46daa5d7b64e470d86b6f681f4f432eb13ac7e84354a`.
  Documented as incompatible with Alpine-based n8n (musl Node.js).
- **Added** musl build (Alpine 3.16 / gcc 11.2.1 / musl 1.2.3): SHA256 `9f9817d0909fbe6db6c056a5f3b5ead043240565d756858021d68d26cf418fde`.
  Verified compatible with n8n 2.13.4 on Alpine Linux v3.22. Installed in production.
- **Documented** binary replacement procedure: vendor CDN is dead; binary must be rebuilt and
  placed manually after every `npm install` or n8n container update.

### Documentation

- **Added** `SECURITY.md` — full audit findings, diffs, binary hashes, and recommendations
- **Updated** `README.md` — security changes, installation notes, binary rebuild instructions
- **Added** `CHANGELOG.md` — this file
- **Added** `audit-report.md` — source code audit results
- **Added** `dependency-report.md` — dependency and supply chain audit results
- **Added** `hash-comparison.txt` — binary SHA256 records for both builds
- **Added** `VERDICT.md` — overall audit verdict and recommended actions
- **Added** `fix-report.md` — detailed description of each fix applied
- **Added** `install-report.md` — VPS deployment steps and verification

---

## [upstream] — original @telepilotco/n8n-nodes-telepilot

See https://github.com/telepilotco/n8n-nodes-telepilot
