# VERDICT

_Audit date: 2026-05-11_
_Package: @telepilotco/n8n-nodes-telepilot v0.5.2_

---

## Source Audit

**SUSPICIOUS**

Primary finding: `credentials/TelePilotApi.credentials.ts:41` — the credential test handler sends an outbound POST to `http://ls.telepilot.co:4413/?key=empty` (vendor-controlled server, not Telegram, plain HTTP). When a user clicks "Test Credentials" in n8n, n8n executes this request. What data (if any) is included in the request body cannot be confirmed without network-level inspection. The "ls" subdomain and non-standard port 4413 are consistent with a license server. No proven exfiltration, but the behavior is unexpected and untransparent.

See `audit-report.md` for full findings.

---

## Dependency Audit

**SUSPICIOUS**

Both runtime dependencies `@telepilotco/tdl@7.4.1` and `@telepilotco/tdlib-binaries-prebuilt@1.8.14` carry install scripts. The dependency graph (node-gyp-build, @mapbox/node-pre-gyp) suggests these are legitimate native-addon build/download hooks, but the actual script contents were not inspectable (node_modules not installed in audit worktree). Additionally, `xlsx@0.19.3` resolves from `cdn.sheetjs.com` rather than npmjs.org — dev-only dependency, hash-pinned, but a non-standard supply-chain trust boundary.

See `dependency-report.md` for full findings.

---

## Binary Build

**SKIPPED** — Docker not available on this Windows machine. The Makefile-based Docker build requires Linux or Docker Desktop. Build must be run on a Linux VPS.

See `build.log` for details.

---

## Hash Comparison

**NOT RUN** — No rebuilt binary was produced (build was skipped). Distributed binary was not replaced.

---

## Final status

⚠️  **SUSPICIOUS** — review `audit-report.md` manually

The source code itself contains no proven backdoor or exfiltration. However, the package has two significant trust gaps that must be resolved before production use:

1. **Credential test endpoint** (`ls.telepilot.co:4413`): an outbound call to a vendor-controlled server over plain HTTP during credential testing. Network traffic must be inspected to confirm no credential fields are transmitted.

2. **Binary trust gap** (the original problem): the distributed `.node` binary in `@telepilotco/tdlib-binaries-prebuilt` could not be rebuilt and hash-compared. We cannot verify the distributed binary matches the published source. This is the core unresolved risk.

---

## Recommended action

**Do not use this package in production without completing two additional steps:**

1. **Network audit the credential test:** Install the package in an isolated environment, connect a network monitor (Wireshark or `mitmproxy`), and click "Test Credentials" in n8n. Capture the exact HTTP request body sent to `http://ls.telepilot.co:4413`. If any of `apiId`, `apiHash`, or `phoneNumber` appear in the request, escalate to CRITICAL and stop all use immediately.

2. **Rebuild the binary on Linux:** Run Agent 3 on a Linux machine with Docker installed:
   ```bash
   cd tdlib-binaries-prebuilt
   make build-lib-docker-linux-x64-glibc 2>&1 | tee ../n8n-nodes-telepilot/build.log
   ```
   Then run Agent 4 to hash-compare the rebuilt binary against the distributed one. If hashes match, the binary is trustworthy. If they do not match, replace the distributed binary with the locally built version and add a reminder to repeat this replacement after every `npm install` or n8n update.

---

## Reminder (if binary is replaced after future build)

After every `npm install` or n8n update, the distributed binary in:
```
node_modules/@telepilotco/tdlib-binaries-prebuilt/prebuilds/
```
will be overwritten with the vendor-distributed version. The locally rebuilt binary must be re-copied after each such event. Consider automating this with a `postinstall` script in your local n8n deployment.
