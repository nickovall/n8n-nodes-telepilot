## dependency-report.md

_Audit date: 2026-05-11_
_Audited package: @telepilotco/n8n-nodes-telepilot v0.5.2_
_Lock files examined: pnpm-lock.yaml (lockfileVersion 9.0), package-lock.json (lockfileVersion 3)_

---

### npm audit summary

`npm audit --json` could not be executed because `node_modules` is not installed in this
worktree. No audit JSON output is available.

Known issues identified from lock file analysis:

| Severity | Package | Note |
|----------|---------|------|
| LOW / DEPRECATED | `fsevents@1.2.13` | Marked deprecated: "contains DANGEROUS / INSECURE binaries". macOS-only, optional, dev-only. |
| DEPRECATED | `chokidar@2.x` | Dev/peer dependency pulled in transitively. "Does not receive security updates since 2019." |
| DEPRECATED | `resolve-url@0.2.1`, `source-map-resolve@0.5.x`, `source-map-url@0.4.1`, `urix` | Dev-chain source-map utilities, all deprecated but not security-relevant. |
| DEPRECATED | `dommatrix` | Dev/peer transitive dep, no longer maintained. |
| INFO | `@acuminous/bitsyntax`, `@aws-sdk/*` variants | No known CVEs flagged in lock data; part of n8n-core/n8n-nodes-base dev deps. |

No critical or high CVEs were identified directly from lock file metadata.

---

### @telepilotco packages

| Package | Version | Registry | postinstall / preinstall / prepare | hasInstallScript |
|---------|---------|----------|------------------------------------|-----------------|
| `@telepilotco/tdl` | 7.4.1 | https://registry.npmjs.org | not readable (no node_modules) | YES (flagged in package-lock.json) |
| `@telepilotco/tdlib-binaries-prebuilt` | 1.8.14 | https://registry.npmjs.org | not readable (no node_modules) | YES (flagged in package-lock.json) |

**Context on install scripts:**

- `@telepilotco/tdl@7.4.1` depends on `node-gyp-build` and `node-addon-api`, which is consistent
  with a native Node.js addon that requires a build step. The install script is expected to invoke
  `node-gyp-build` to compile or locate a pre-built binary. This is a known, well-understood
  pattern for native addons.

- `@telepilotco/tdlib-binaries-prebuilt@1.8.14` depends on `@mapbox/node-pre-gyp`, which is the
  standard tool for downloading pre-built native binaries. The install script is expected to
  download a matching pre-built TDLib binary from a release URL. This is standard behavior for
  packages distributing pre-built native binaries.

Neither package is readable from node_modules (not installed), so the exact script commands could
not be inspected directly. Based on the dependency graph, the scripts appear to serve legitimate
native-addon purposes.

---

### Non-standard registries found

| Package | Registry URL | Who depends on it | Scope |
|---------|-------------|-------------------|-------|
| `xlsx@0.19.3` | `https://cdn.sheetjs.com/xlsx-0.19.3/xlsx-0.19.3.tgz` | `n8n-nodes-base@1.31.0` (dev/peer) | dev + peer only |

**Details:** The `xlsx` package is fetched from `cdn.sheetjs.com` rather than the npm registry.
This is a known intentional decision by the SheetJS project — the maintainers stopped publishing
to npm and self-host on their own CDN. The package itself (`xlsx` / SheetJS) is widely used and
the CDN is operated by the SheetJS project. However, it represents a supply-chain trust boundary:
the tarball is not served by registry.npmjs.org and its integrity is enforced only by the
SHA-512 hash pinned in the lock file
(`sha512-8IfgFctB7fkvqkTGF2MnrDrC6vzE28Wcc1aSbdDQ+4/WFtzfS73YuapbuaPZwGqpR2e0EeDMIrFOJubQVLWFNA==`).

Importantly, `xlsx` is brought in exclusively by `n8n-nodes-base`, which is a **dev + peer
dependency** of this package. It is NOT shipped in the published npm artifact of
`@telepilotco/n8n-nodes-telepilot` and does not affect end-user installations.

All other packages resolve from `https://registry.npmjs.org`.

---

### Packages with install scripts (full list from package-lock.json)

Beyond the two `@telepilotco` packages, the following also have `hasInstallScript: true`:

| Package | Version | Type | Reason |
|---------|---------|------|--------|
| `cpu-features@0.0.9` | 0.0.9 | dev/peer | native addon (ssh2 dep) |
| `es5-ext@0.10.64` | 0.10.64 | dev/peer | postinstall notification script (known benign) |
| `eslint-plugin-n8n-nodes-base@1.16.1` | 1.16.1 | dev | eslint plugin build step |
| `fsevents@1.2.13` | 1.2.13 | dev/peer/optional | macOS native FS watcher (deprecated v1) |
| `fsevents@2.3.3` | 2.3.3 | dev/peer | macOS native FS watcher (current) |
| `ssh2@1.15.0` | 1.15.0 | dev/peer | native addon |

None of these are runtime dependencies of the published package.

---

### VERDICT

**SUSPICIOUS**

**Rationale:**

1. **Install scripts on core runtime deps:** Both `@telepilotco/tdl` and
   `@telepilotco/tdlib-binaries-prebuilt` carry install scripts. The scripts cannot be read
   without installing the packages. The dependency graph (node-gyp-build, node-pre-gyp) strongly
   suggests these are legitimate native-addon build/download hooks — this is the expected
   pattern for TDLib (Telegram Database Library) bindings. However, these install scripts
   run arbitrary code at install time, which is a supply-chain risk by definition.
   **Recommendation:** inspect the actual postinstall scripts in the published npm tarballs
   before deploying to production systems, especially for `tdlib-binaries-prebuilt` which
   downloads binaries from an external URL at install time.

2. **Non-standard registry for xlsx:** `cdn.sheetjs.com` is not registry.npmjs.org. This only
   affects the dev install (not the published package), and integrity is hash-pinned. Risk is
   LOW for end users but MEDIUM for developers installing the full dev tree.

3. **No critical CVEs detected** from lock file metadata.

4. **All packages (except xlsx) resolve from registry.npmjs.org** — no unknown or private
   registries.

5. **Deprecated `fsevents@1.2.13`** present in dev dependencies — flagged as containing
   insecure binaries, but it is macOS-only and optional.

**Upgrade recommendations:**
- Pin and inspect `@telepilotco/tdlib-binaries-prebuilt` postinstall script to verify binary
  download URL and checksum validation.
- Remove or upgrade `fsevents@1.2.13` from the dev dependency chain.
- Accept `xlsx` from SheetJS CDN as a known deviation, or explicitly document in a security
  exception log.
