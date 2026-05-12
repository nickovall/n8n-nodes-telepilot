# install-report.md

_Date: 2026-05-12_
_Branch: claude/exciting-shockley-c226b2_

---

## Summary

`@telepilotco/n8n-nodes-telepilot` has been installed on the VPS into n8n's community nodes
directory using a freshly rebuilt musl TDLib binary. The package loads correctly and both
node types are active.

---

## Target environment

| Property | Value |
|----------|-------|
| VPS | ubuntu@152.228.128.114 |
| n8n container | `n8n-compose-n8n-1` |
| n8n version | 2.13.4 |
| Container base | Docker Hardened Images / Alpine Linux v3.22 |
| Node.js | v24.13.1 (musl-linked) |
| Architecture | x86_64 |
| n8n data volume | `n8n-compose_n8n_data` → `/home/node/.n8n` inside container |
| Nodes install path | `/home/node/.n8n/nodes/node_modules/` |

---

## Steps performed

### 1. Package installation

Installed the package with `--ignore-scripts` to skip the broken `node-pre-gyp` binary
download (vendor URL returns HTTP 404 for `linux-x64-musl.tar.gz` and `linux-x64-glibc.tar.gz`):

```
docker run --rm \
  -v <n8n_data_volume>:/home/node/.n8n \
  --entrypoint npm \
  docker.n8n.io/n8nio/n8n:2.13.4 \
  install @telepilotco/n8n-nodes-telepilot --ignore-scripts \
  --prefix /home/node/.n8n/nodes
```

Result: 64 packages installed at `/home/node/.n8n/nodes/node_modules/`.

### 2. Binary substitution — musl TDLib

**Why necessary:** The vendor binary distribution at `https://telepilot.co/tdlib-binaries-prebuilt/`
returns HTTP 404 for all variants. Any fresh install has no binary. Additionally, the n8n container
uses musl-linked Node.js — a glibc binary would fail at `dlopen()` with
`fcntl64: symbol not found`.

**Build 1 (failed — glibc):** Rebuilt on Ubuntu 20.04 in Docker → glibc binary confirmed
incompatible with musl Alpine n8n.

**Build 2 (used — musl):** Rebuilt on Alpine 3.16 in Docker:
- TDLib commit: `66234ae2537a99ec0eaf7b0857245a6e5c2d2bc9`
- Toolchain: gcc 11.2.1, cmake 3.23.5, musl 1.2.3
- Static deps: OpenSSL 1.1.1w (static), zlib 1.2.12 (static)
- Output: `libtdjson.so`, 26 MB, stripped
- SHA256: `9f9817d0909fbe6db6c056a5f3b5ead043240565d756858021d68d26cf418fde`

Binary placed at:
```
/home/node/.n8n/nodes/node_modules/@telepilotco/tdlib-binaries-prebuilt/prebuilds/libtdjson.so
```

The `prebuilds/` directory was absent from the npm tarball (only README.md + package.json
shipped) and was created manually before copying the binary.

### 3. reflect-metadata dependency

`reflect-metadata` is a peer dependency of `typedi` (used by the package) and is not
auto-installed by npm. Installed manually:

```
docker run --rm \
  -v <n8n_data_volume>:/home/node/.n8n \
  --entrypoint npm \
  docker.n8n.io/n8nio/n8n:2.13.4 \
  install reflect-metadata --ignore-scripts \
  --prefix /home/node/.n8n/nodes
```

### 4. compose.yaml — enable community packages

Changed `N8N_COMMUNITY_PACKAGES_ENABLED=false` → `=true` in
`/home/ubuntu/n8n-compose/compose.yaml`.

**Why this was needed:** While n8n's file-system loading of community packages is gated on
`N8N_COMMUNITY_PACKAGES_PREVENT_LOADING` (not set → defaults to `false`, allowing loading),
setting `enabled=true` was required to ensure `CommunityPackagesModule` properly registers
in the module registry and contributes its `loadDir()` path to the node scanner.

### 5. Container restart

```
cd /home/ubuntu/n8n-compose && docker compose up -d n8n
```

Only `n8n-compose-n8n-1` was recreated. All other containers (postgres, traefik, miniapp,
amnezia-wg-easy, pcc-miniapp) remained untouched.

---

## Verification

### Icon endpoint (HTTP 200 = node loaded by n8n)

```
GET http://localhost:5678/icons/@telepilotco/n8n-nodes-telepilot/dist/nodes/TelePilot/TelePilot.svg
→ HTTP/1.1 200 OK  (Content-Type: image/svg+xml, Content-Length: 2036)
```

### Direct loader simulation (inside container)

```javascript
const loader = new LazyPackageDirectoryLoader(
  '/home/node/.n8n/nodes/node_modules/@telepilotco/n8n-nodes-telepilot', [], []);
await loader.loadAll();
// → NODES: telePilot, telePilotTrigger
// → CREDS: telePilotApi
```

### Binary

| Property | Value |
|----------|-------|
| Path | `/home/node/.n8n/nodes/node_modules/@telepilotco/tdlib-binaries-prebuilt/prebuilds/libtdjson.so` |
| Size | 26,427,704 bytes |
| SHA256 | `9f9817d0909fbe6db6c056a5f3b5ead043240565d756858021d68d26cf418fde` |
| Built from | TDLib commit `66234ae2537a99ec0eaf7b0857245a6e5c2d2bc9` |
| Libc | musl (Alpine 3.16 build) — compatible with Alpine n8n container |
| Original vendor binary | UNAVAILABLE (HTTP 404) — hash comparison not possible |

### n8n startup log (no errors)

```
Initializing n8n process
n8n ready on ::, port 5678
Activated workflow "ERR_Global_Handler"
...all 11 workflows activated...
Editor is now accessible via: https://nickelautomata.duckdns.org
```

No errors related to telepilot loading.

---

## Installed files summary

```
/home/node/.n8n/nodes/
  package.json                          (npm prefix manifest)
  node_modules/
    @telepilotco/
      n8n-nodes-telepilot/              (the main package, 64 total pkgs)
        dist/credentials/TelePilotApi.credentials.js  ← fix applied (no vendor test call)
        dist/nodes/TelePilot/TelePilot.node.js
        dist/nodes/TelePilot/TelePilotTrigger.node.js
        dist/nodes/TelePilot/TelePilot.svg
      tdlib-binaries-prebuilt/
        prebuilds/
          libtdjson.so                  ← musl rebuild, SHA256 above
      tdl/
        prebuilds/linux-x64/
          node.napi.musl.node           ← shipped by vendor in npm tarball ✓
    reflect-metadata/                   ← manually installed peer dep
```

---

## Notes for future reinstalls

- After every `npm install` or n8n container update, run steps 1–3 again — the vendor binary
  download URL is broken (404) and will leave no binary. The rebuilt `libtdjson.so` must be
  replaced manually.
- `N8N_COMMUNITY_PACKAGES_ENABLED=true` must remain set for n8n to scan the nodes directory.
- The fix from `fix-report.md` (credential test endpoint removal) is baked into the installed
  `dist/credentials/TelePilotApi.credentials.js` — but check again after a reinstall since
  npm will re-download the unpatched upstream package.
