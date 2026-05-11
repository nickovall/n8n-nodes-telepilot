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

**SUCCESS** — TDLib rebuilt from source on Linux VPS (ubuntu@152.228.128.114).

- Build environment: Docker `ubuntu:20.04`, gcc 9.4.0, cmake 3.16.3, glibc 2.31
- TDLib commit: `66234ae2537a99ec0eaf7b0857245a6e5c2d2bc9`
- Output: `libtdjson.so` 26MB, stripped
- SHA256 rebuilt: `0ee03d6e3b49acbb443b46daa5d7b64e470d86b6f681f4f432eb13ac7e84354a`

See `build.log` for full cmake output.

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

⚠️  **SUSPICIOUS** — review `audit-report.md` and `hash-comparison.txt` manually

The source code itself contains no proven backdoor or exfiltration. However, the package has two significant trust gaps that must be resolved before production use:

1. **Credential test endpoint** (`ls.telepilot.co:4413`): an outbound call to a vendor-controlled server over plain HTTP during credential testing. Network traffic must be inspected to confirm no credential fields are transmitted.

2. **Binary trust gap** (the original problem): the distributed `.node` binary in `@telepilotco/tdlib-binaries-prebuilt` could not be rebuilt and hash-compared. We cannot verify the distributed binary matches the published source. This is the core unresolved risk.

---

## Recommended action

**Three actions required:**

1. **[DONE — Fix 1] Credential test call removed.** The `test` block posting to `http://ls.telepilot.co:4413` has been removed from `credentials/TelePilotApi.credentials.ts`. See `fix-report.md`.

2. **[NEW FINDING] Distribution URL is broken (404).** `https://telepilot.co/tdlib-binaries-prebuilt/v1.8.14/linux-x64-glibc.tar.gz` returns HTTP 404. Any fresh `npm install` will fail to download the binary. The vendor binary in existing installations cannot be verified — the source for comparison is gone.

   **Action:** Replace the vendor binary in your n8n installation with the freshly rebuilt one:
   ```
   SHA256:    0ee03d6e3b49acbb443b46daa5d7b64e470d86b6f681f4f432eb13ac7e84354a
   Built from: TDLib commit 66234ae2537a99ec0eaf7b0857245a6e5c2d2bc9
   Built with: gcc 9.4.0 / cmake 3.16.3 / glibc 2.31 / OpenSSL 1.1.1f / zlib 1.2.11
   ```
   The rebuilt `libtdjson.so` is the only verifiable binary derived from published source.

3. **[HISTORICAL] Network audit the credential test endpoint.** If you ran an older installed version before Fix 1, intercept traffic with Wireshark/mitmproxy on credential test to confirm what data was sent to `ls.telepilot.co:4413`.

---

## Reminder — binary after npm install

After every `npm install` or n8n update, the `node-pre-gyp install` script will attempt to re-download from the (now broken 404) URL and will fail or leave no binary. The rebuilt `libtdjson.so` must be replaced manually after each such event. Consider pinning the binary in your deployment rather than relying on the vendor CDN.
