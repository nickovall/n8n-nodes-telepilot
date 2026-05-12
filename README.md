# n8n-nodes-telepilot (Security-Hardened Fork)

> Fork of [@telepilotco/n8n-nodes-telepilot](https://github.com/telepilotco/n8n-nodes-telepilot)
> with security audit, binary verification, and credential exfiltration fix applied.

## What was changed from upstream

### Fix 1 — Removed credential exfiltration call (CRITICAL)

- **File:** `credentials/TelePilotApi.credentials.ts`
- The original package sent a POST request to `http://ls.telepilot.co:4413` (vendor-controlled
  license server, plain HTTP) every time credentials were tested in the n8n UI.
- Removed entirely. Credentials are now validated at first use against Telegram MTProto servers
  directly.

### Fix 2 — Binary rebuilt from source

- The original distributed binary (`libtdjson.so`) was unavailable from all vendor sources
  (URL 404, GitHub Releases empty, npm tarball ships no binary — only README + package.json).
- Binary was rebuilt from official `tdlib/td` source (commit `66234ae2537a99ec0eaf7b0857245a6e5c2d2bc9`)
  using Docker.
- Two builds were performed:
  - **glibc** (Ubuntu 20.04): SHA256 `0ee03d6e3b49acbb443b46daa5d7b64e470d86b6f681f4f432eb13ac7e84354a` — incompatible with Alpine-based n8n (fcntl64 symbol not found)
  - **musl** (Alpine 3.16): SHA256 `9f9817d0909fbe6db6c056a5f3b5ead043240565d756858021d68d26cf418fde` — verified compatible, installed in production
- Binary passes `dlopen` test and node type registration inside n8n 2.13.4 on Alpine Linux v3.22.

---

## Security audit summary

| Check | Result |
|---|---|
| Hidden outbound HTTP calls in source | ✅ Found and removed (`ls.telepilot.co:4413`) |
| Compiled `dist/` scan | ✅ Clean — matches TypeScript source |
| npm `postinstall` scripts | ✅ Standard native addon patterns only (`node-gyp-build`, `node-pre-gyp`) |
| Prebuilt binary origin | ⚠️ Vendor URL 404 — rebuilt from official TDLib source |
| Binary compatibility (musl / Alpine n8n) | ✅ Verified — nodes load, icon endpoint 200 |
| `@telepilotco/tdl` `.node` addon | ⚠️ Vendor-supplied; source available but not rebuilt in this audit |

See [SECURITY.md](SECURITY.md) for the full audit report.

---

## Installation

### Requirements

- n8n self-hosted (Docker)
- `N8N_COMMUNITY_PACKAGES_ENABLED=true` in your compose.yaml
- Telegram `api_id` and `api_hash` from [my.telegram.org](https://my.telegram.org)

### Install

```bash
# 1. Install the package (--ignore-scripts skips the broken vendor binary download)
npm install github:nickovall/n8n-nodes-telepilot --ignore-scripts \
  --prefix /home/node/.n8n/nodes

# 2. Install missing peer dependency
npm install reflect-metadata --ignore-scripts \
  --prefix /home/node/.n8n/nodes

# 3. Copy the musl binary (required for Alpine-based n8n)
#    See "Rebuild binary yourself" section below for build instructions
cp /path/to/libtdjson.so \
  /home/node/.n8n/nodes/node_modules/@telepilotco/tdlib-binaries-prebuilt/prebuilds/libtdjson.so
```

For Docker-based n8n, mount the data volume and run npm inside the n8n image:

```bash
docker run --rm \
  -v n8n_data:/home/node/.n8n \
  --entrypoint npm \
  docker.n8n.io/n8nio/n8n:2.13.4 \
  install github:nickovall/n8n-nodes-telepilot --ignore-scripts \
  --prefix /home/node/.n8n/nodes
```

### Rebuild binary yourself

The musl build is required for all Docker n8n installations (Alpine Linux base):

```bash
git clone https://github.com/nickovall/tdlib-binaries-prebuilt
cd tdlib-binaries-prebuilt

# For Alpine/musl n8n (most Docker installs):
docker run --rm \
  -v $(pwd):/rep \
  --platform linux/amd64 \
  alpine:3.16 \
  sh /rep/prebuilt-tdlib-docker.sh

# Output: prebuilds/lib/libtdjson.so
# Verified musl SHA256: 9f9817d0909fbe6db6c056a5f3b5ead043240565d756858021d68d26cf418fde
```

### After install — enable community packages

In your n8n `compose.yaml`:

```yaml
environment:
  - N8N_COMMUNITY_PACKAGES_ENABLED=true
```

Then restart only the n8n container:

```bash
docker compose up -d n8n
```

### Notes for reinstalls

- After every `npm install` or n8n container update, repeat steps 1–3 above. The vendor binary
  download URL returns HTTP 404 and will leave no binary.
- The credential fix (removal of `ls.telepilot.co:4413` call) is in the TypeScript source.
  Reinstalling from this fork preserves the fix automatically.

---

## Original package

This is a fork of [telepilotco/n8n-nodes-telepilot](https://github.com/telepilotco/n8n-nodes-telepilot).
Original functionality is unchanged. See the upstream README for usage instructions (credentials
setup, login via QR code, available actions).

Original features include:
- Send and receive Telegram messages as a real user account (not a bot)
- Listen for events: new messages, deletions, edits, reactions
- Interact with channels, groups, private chats
- Schedule message posting
- Receive API events unavailable to bots (e.g. message deletion notifications)

For usage documentation, credentials setup (api_id / api_hash), and login flow, refer to
[upstream README](https://github.com/telepilotco/n8n-nodes-telepilot#readme).

---

## License

MIT — same as upstream.
