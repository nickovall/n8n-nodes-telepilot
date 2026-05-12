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

**SUCCESS** — TDLib rebuilt from source twice; musl build used in production.

**Build 1 — glibc (Ubuntu 20.04):** FAILED in production.
- SHA256: `0ee03d6e3b49acbb443b46daa5d7b64e470d86b6f681f4f432eb13ac7e84354a`
- Reason: n8n 2.13.4 runs musl-linked Node.js on Alpine Linux v3.22; glibc binary fails at
  `dlopen()` with `fcntl64: symbol not found`.

**Build 2 — musl (Alpine 3.16): DEPLOYED.**
- Build environment: Docker `alpine:3.16`, gcc 11.2.1, cmake 3.23.5, musl 1.2.3
- TDLib commit: `66234ae2537a99ec0eaf7b0857245a6e5c2d2bc9`
- Static deps: OpenSSL 1.1.1w, zlib 1.2.12
- Output: `libtdjson.so` 26 MB, stripped
- SHA256: `9f9817d0909fbe6db6c056a5f3b5ead043240565d756858021d68d26cf418fde`
- Status: Installed at `/home/node/.n8n/nodes/node_modules/@telepilotco/tdlib-binaries-prebuilt/prebuilds/libtdjson.so`

See `build.log` for cmake output (glibc build); musl build run directly on VPS via Docker.

---

## Hash Comparison

**NOT_APPLICABLE** — Rebuilt binary produced, but distributed binary is **UNAVAILABLE**:

- `https://telepilot.co/tdlib-binaries-prebuilt/v1.8.14/linux-x64-glibc.tar.gz` → **HTTP 404**
- GitHub releases for `nickovall/tdlib-binaries-prebuilt` → **empty, no releases published**
- npm tarball `@telepilotco/tdlib-binaries-prebuilt@1.8.14` → **2 files only** (README.md + package.json, 3KB — no binary included)

The vendor's binary distribution endpoint is broken or removed. Any fresh `npm install` of this package would fail to download the binary. The binary used by existing installations was downloaded at some prior point when the URL was still live — that binary cannot be retrieved for comparison.

See `hash-comparison.txt` for details.

---

## Final status

⚠️  **SUSPICIOUS → MITIGATED** — both original risk items resolved; one historical item remains.

The source code contains no proven backdoor. The two significant trust gaps have been addressed:

1. **Credential test endpoint** (`ls.telepilot.co:4413`): **REMOVED** (Fix 1). Outbound call to
   vendor license server over plain HTTP is gone from `credentials/TelePilotApi.credentials.ts`.

2. **Binary trust gap**: **MITIGATED** (Fix 2). Vendor binary was unavailable (HTTP 404). A musl
   TDLib was rebuilt from the published TDLib source at commit `66234ae2...` and installed in place
   of the missing vendor binary. Hash comparison with the original vendor binary is impossible
   (vendor never published it), but the installed binary is derived from auditable source.

   Historical risk: any binary installed *before* the vendor CDN went 404 cannot be verified.
   If n8n was running this package before this audit, consider the prior binary untrusted.

---

## Recommended action

**Three actions required:**

1. **[DONE — Fix 1] Credential test call removed.** The `test` block posting to `http://ls.telepilot.co:4413` has been removed from `credentials/TelePilotApi.credentials.ts`. See `fix-report.md`.

2. **[DONE — Fix 2] Vendor binary replaced with musl rebuild.** Distribution URL returns HTTP 404
   for all variants. A musl TDLib was rebuilt from source and installed manually.
   ```
   SHA256:    9f9817d0909fbe6db6c056a5f3b5ead043240565d756858021d68d26cf418fde
   Built from: TDLib commit 66234ae2537a99ec0eaf7b0857245a6e5c2d2bc9
   Built with: gcc 11.2.1 / cmake 3.23.5 / musl 1.2.3 / OpenSSL 1.1.1w / zlib 1.2.12
   ```
   Installed at: `/home/node/.n8n/nodes/node_modules/@telepilotco/tdlib-binaries-prebuilt/prebuilds/libtdjson.so`
   Verified: icon endpoint returns HTTP 200; `telePilot` and `telePilotTrigger` node types loaded.
   See `install-report.md` for full deployment steps.

3. **[HISTORICAL] Network audit the credential test endpoint.** If you ran an older installed version before Fix 1, intercept traffic with Wireshark/mitmproxy on credential test to confirm what data was sent to `ls.telepilot.co:4413`.

---

## Reminder — binary after npm install

After every `npm install` or n8n update, the `node-pre-gyp install` script will attempt to re-download from the (now broken 404) URL and will fail or leave no binary. The rebuilt `libtdjson.so` must be replaced manually after each such event. Consider pinning the binary in your deployment rather than relying on the vendor CDN.
