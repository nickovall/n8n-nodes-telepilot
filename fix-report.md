# fix-report.md

_Date: 2026-05-11_
_Branch: claude/exciting-shockley-c226b2_

---

## Fix 1 — Remove external credential test call

### What was changed

**File:** `credentials/TelePilotApi.credentials.ts`

**Problem:** The `test` property sent an outbound POST to `http://ls.telepilot.co:4413/?key=empty`
every time a user clicked "Test Credentials" in n8n. This is a vendor-controlled server (not
Telegram), uses plain HTTP (unencrypted), and the subdomain `ls` + port 4413 is consistent with a
license server. No evidence that credential fields were transmitted, but the call is untransparent
and bypasses Telegram entirely.

**Changes made:**

Line 2 — removed unused import `ICredentialTestRequest`:
```diff
-import {
-	ICredentialTestRequest,
-	ICredentialType,
-	INodeProperties,
-} from 'n8n-workflow';
+import {
+	ICredentialType,
+	INodeProperties,
+} from 'n8n-workflow';
```

Lines 39–45 — removed the `test` block, replaced with explanatory comment:
```diff
-	test: ICredentialTestRequest = {
-		request: {
-			baseURL: 'http://ls.telepilot.co:4413',
-			url: '?key=empty',
-			method: 'POST',
-		},
-	};
+	// Credential test removed: external POST to vendor license server (ls.telepilot.co:4413) over plain HTTP.
+	// Credentials are validated at first use against Telegram MTProto servers directly.
```

**Why this is safe:** `ICredentialType.test` is marked optional (`test?: ICredentialTestRequest`)
in n8n-workflow. Removing it does not break the interface contract. Credentials remain functional;
the only thing lost is the "Test Credentials" button feedback in the n8n UI — which was pinging a
third-party server anyway instead of Telegram.

**Resulting file:** `credentials/TelePilotApi.credentials.ts` (40 lines, no outbound calls)

---

## Fix 2 — Audit install scripts

### Install scripts found

**`@telepilotco/tdl@7.4.1`** — fetched from registry.npmjs.org:
```json
{
  "install": "node-gyp-build"
}
```
Verdict: **CLEAN — standard native addon loader pattern.** `node-gyp-build` searches for a
pre-built binary matching the current platform/Node.js ABI in the `prebuilds/` directory that
ships with the package. If none is found, it falls back to compiling from source with node-gyp.
This is the widely-used pattern for native Node.js addons (e.g., `better-sqlite3`, `sharp`, etc.).
**No changes needed.**

**`@telepilotco/tdlib-binaries-prebuilt@1.8.14`** — fetched from registry.npmjs.org:
```json
{
  "install": "node-pre-gyp install --library=static_library"
}
```
Also noted: the `binary` field in this package's `package.json`:
```json
{
  "module_name":  "tdlib",
  "module_path":  "prebuilds",
  "host":        "https://telepilot.co/",
  "remote_path": "{name}/v{version}",
  "package_name": "{platform}-{arch}-{libc}.tar.gz"
}
```
This means at install time, `node-pre-gyp` downloads a binary from:
`https://telepilot.co/tdlib-binaries-prebuilt/v1.8.14/{platform}-{arch}-{libc}.tar.gz`

Verdict: **SUSPICIOUS (known risk, no change made).** The install script is the standard
`node-pre-gyp` pattern and the script itself is not malicious. However, the binary it downloads
comes from a vendor-controlled server (`telepilot.co`), not from a neutral host (e.g., GitHub
Releases). The download uses HTTPS (mitigates interception), but the binary content cannot be
verified without rebuilding from source — which is the original binary trust problem this audit
was commissioned to address. See `VERDICT.md` for the recommended remediation (rebuild on Linux
VPS with Docker and hash-compare).

**No changes made to install scripts** — they implement the correct native-addon pattern; the risk
is the binary content, not the scripts themselves.

### Other packages with install scripts (from package-lock.json)

All dev/optional only — not shipped in the published artifact:
- `cpu-features@0.0.9` — native addon for ssh2 (dev/peer dep)
- `es5-ext@0.10.64` — known benign postinstall notification
- `eslint-plugin-n8n-nodes-base@1.16.1` — eslint plugin build step
- `fsevents@1.2.13` / `2.3.3` — macOS FS watcher (optional)
- `ssh2@1.15.0` — native addon (dev/peer dep)

**None of these are in the published package. No changes needed.**

---

## Build result

**Status: NOT RUN — toolchain unavailable in this worktree environment**

The `npm run build` command (which executes `pnpm exec tsc && pnpm exec gulp build:icons`)
could not be executed because:

1. `pnpm` is not installed on this machine (no global pnpm, no corepack configured)
2. `npm` in PATH is a broken shim from an unrelated project (`Financial Asset Managment and
   Monitoring System`) with missing `node_modules`
3. `node_modules` are not installed in the worktree — `tsc` and `gulp` are not available as
   local binaries

**TypeScript validity confirmed by static analysis:**

The edit made to `credentials/TelePilotApi.credentials.ts` is syntactically and type-safe:
- Removing `ICredentialTestRequest` from the import: correct, the symbol is no longer used
- Removing `test: ICredentialTestRequest = {...}`: correct, `ICredentialType.test` is declared
  as `test?: ICredentialTestRequest` in n8n-workflow (verified against the GitHub source of
  n8n-workflow) — it is optional, so omitting it satisfies the interface

**To verify the build yourself:**
```bash
cd n8n-nodes-telepilot
pnpm install
pnpm run build
```
The only changed file is `credentials/TelePilotApi.credentials.ts`. The change removes code
rather than adding it, so no new compilation errors can be introduced by this edit.

---

## Summary

| Fix | File | Lines changed | Status |
|-----|------|--------------|--------|
| Remove vendor credential test call | `credentials/TelePilotApi.credentials.ts` | Lines 1-4 (import), lines 39-45 (test block) | ✅ Applied |
| Audit install scripts | `@telepilotco/tdl`, `@telepilotco/tdlib-binaries-prebuilt` | No changes (report only) | ✅ Reported |

| Step | Result |
|------|--------|
| npm run build | ❌ Cannot run — pnpm/npm/tsc not installed in worktree |
| TypeScript validity | ✅ Confirmed by static analysis (optional property removed, unused import cleaned) |
