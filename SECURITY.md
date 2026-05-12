# Security Audit — n8n-nodes-telepilot Fork

**Audit date:** May 2026
**Auditor:** nickovall
**Upstream version audited:** 0.5.2
**Upstream repo:** https://github.com/telepilotco/n8n-nodes-telepilot

---

## Findings

### CRITICAL (Fixed) — Credential exfiltration endpoint

- **File:** `credentials/TelePilotApi.credentials.ts`, line 41
- **Issue:** The `test` block in the credential type POSTed to `http://ls.telepilot.co:4413/?key=empty`
  on every "Test Credentials" click in the n8n UI. Plain HTTP, vendor-controlled server (subdomain
  `ls` + port 4413 consistent with a license server). The credential type defines `apiId`, `apiHash`,
  and `phoneNumber` fields — possible credential harvesting if n8n injects these into the request body.
- **Fix:** Removed the `test` block entirely. Removed unused `ICredentialTestRequest` import.
  `ICredentialType.test` is optional in `n8n-workflow` — removing it does not break the interface.
  The "Test Credentials" button in the n8n UI will no longer function, which is the correct behavior:
  credentials are validated on first use against Telegram MTProto servers directly.
- **Diff:**
  ```diff
  -import {
  -    ICredentialTestRequest,
  -    ICredentialType,
  -    INodeProperties,
  -} from 'n8n-workflow';
  +import {
  +    ICredentialType,
  +    INodeProperties,
  +} from 'n8n-workflow';

  -    test: ICredentialTestRequest = {
  -        request: {
  -            baseURL: 'http://ls.telepilot.co:4413',
  -            url: '?key=empty',
  -            method: 'POST',
  -        },
  -    };
  +    // Credential test removed: external POST to vendor license server (ls.telepilot.co:4413) over plain HTTP.
  +    // Credentials are validated at first use against Telegram MTProto servers directly.
  ```

---

### HIGH (Mitigated) — Unverifiable prebuilt binary

- **Package:** `@telepilotco/tdlib-binaries-prebuilt@1.8.14`
- **Issue:** The vendor binary distribution endpoint
  (`https://telepilot.co/tdlib-binaries-prebuilt/v1.8.14/linux-x64-{glibc,musl}.tar.gz`) returns
  HTTP 404. GitHub Releases for the repo are empty. The npm tarball ships only README.md and
  package.json (3 KB total) — no binary. Any fresh `npm install` fails silently with no binary.
  The binary used in prior installations cannot be retrieved for hash comparison.
- **Mitigation:** TDLib rebuilt from official source (`tdlib/td` commit `66234ae2537a99ec0eaf7b0857245a6e5c2d2bc9`).
  Two builds performed:
  - **glibc** (Ubuntu 20.04 / gcc 9.4.0 / cmake 3.16.3): SHA256 `0ee03d6e3b49acbb443b46daa5d7b64e470d86b6f681f4f432eb13ac7e84354a` — incompatible with Alpine n8n (glibc `fcntl64` symbol absent in musl)
  - **musl** (Alpine 3.16 / gcc 11.2.1 / cmake 3.23.5 / musl 1.2.3 / OpenSSL 1.1.1w static / zlib 1.2.12 static): SHA256 `9f9817d0909fbe6db6c056a5f3b5ead043240565d756858021d68d26cf418fde` — **installed in production**
- **Verification:** musl binary loads correctly in n8n 2.13.4 on Alpine Linux v3.22 with Node.js
  v24.13.1 (musl-linked). Node types `telePilot` and `telePilotTrigger` register successfully.
  Icon endpoint returns HTTP 200.
- **Remaining risk:** Hash comparison with the original vendor binary is impossible — it was never
  made available. Any binary installed from the upstream package before the CDN went down is
  unverifiable.

---

### MEDIUM (Accepted) — `@telepilotco/tdl` native addon

- **Package:** `@telepilotco/tdl@7.4.1`
- **Issue:** Ships a prebuilt native Node.js addon (`node.napi.musl.node`) via the npm tarball.
  Install script is `node-gyp-build` — a standard native addon loader that uses the pre-built
  binary from the `prebuilds/` directory.
- **Status:** Not rebuilt in this audit. Source is available at the `@telepilotco/tdl` repository
  (a fork of the upstream `tdl` TDLib Node.js binding). The npm tarball ships the binary directly
  (not via CDN download), so the published tarball hash from npmjs.org provides a stable reference.
- **Action if rebuilding:** Clone `@telepilotco/tdl`, run `node-gyp rebuild` on the target platform,
  replace `prebuilds/linux-x64/node.napi.musl.node`.

---

### LOW — Install scripts

- `@telepilotco/tdl@7.4.1`: `node-gyp-build` — standard native addon binary selector/loader.
  Searches for a pre-built binary in `prebuilds/` matching platform/ABI. Falls back to source
  compilation. No network access. **Clean.**
- `@telepilotco/tdlib-binaries-prebuilt@1.8.14`: `node-pre-gyp install` — standard binary
  download pattern. Vendor CDN URL now returns HTTP 404, making this a no-op. **No longer
  executes a download.**

---

### LOW — Non-standard registry

- `xlsx@0.19.3` resolves from `cdn.sheetjs.com` rather than `registry.npmjs.org`. Brought in
  by `n8n-nodes-base` (dev/peer dependency only). **Not shipped in the published package.** Integrity
  is hash-pinned in the lock file (`sha512-8IfgF...`). Risk is LOW for end users; MEDIUM for
  developers running `pnpm install` from the full dev tree.

---

## What was NOT audited

- `@telepilotco/tdl` native `.node` binary — source is available, not rebuilt in this audit
- Runtime MTProto traffic — Telegram API calls go through `tdl`/TDLib (MTProto); no secondary
  channels observed in source, but network-level traffic analysis was not performed
- `dist/` directory — not present in the worktree; the installed `dist/` was inspected but not
  diff'd against a clean TypeScript compilation

---

## Recommendations for users

1. **Use a dedicated Telegram account**, not your primary — the package has full MTProto access
2. **Monitor outbound traffic** from the n8n container; Telegram ranges are `149.154.0.0/16` and `91.108.0.0/16`
3. **Rebuild all binaries from source** if 100% supply-chain trust is required
4. **Re-apply the binary after every `npm install`** — the vendor CDN is dead; a fresh install
   leaves no binary at the expected path
5. **Keep `N8N_COMMUNITY_PACKAGES_ENABLED=true`** in your n8n environment for the package to load
