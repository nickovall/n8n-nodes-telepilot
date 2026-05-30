# n8n-nodes-telepilot

Independent open-source n8n community node package for Telegram user-account automation through TDLib.
It started from the MIT-licensed [`@telepilotco/n8n-nodes-telepilot`](https://github.com/telepilotco/n8n-nodes-telepilot)
codebase and has been substantially reworked for safer packaging, cleaner installation, and supply-chain transparency.

This package provides n8n community nodes for Telegram user-account automation through TDLib:

- send and receive Telegram messages as a user account, not a bot
- listen for message, edit, delete, and reaction events
- work with private chats, groups, channels, contacts, files, and custom TDLib requests

## What changed from the original baseline

- Removed the credential test request to `http://ls.telepilot.co:4413`.
- Kept credential validation at first Telegram/TDLib use instead of calling a vendor server.
- Documented the broken original TDLib binary distribution and the verified local rebuild hash.
- Fixed package metadata and build/pack scripts so the repository can be installed from GitHub.

## Install from GitHub

The original TDLib binary package tried to download from a vendor URL that currently returns 404.
This package does not depend on that broken package. Install with scripts disabled, then copy a verified
`libtdjson.so` into the path where the node expects TDLib.

```bash
npm install github:nickovall/n8n-nodes-telepilot --ignore-scripts \
  --prefix /home/node/.n8n/nodes

mkdir -p /home/node/.n8n/nodes/node_modules/@telepilotco/tdlib-binaries-prebuilt/prebuilds

cp /path/to/libtdjson.so \
  /home/node/.n8n/nodes/node_modules/@telepilotco/tdlib-binaries-prebuilt/prebuilds/libtdjson.so
```

For Docker-based n8n:

```bash
docker run --rm \
  -v n8n_data:/home/node/.n8n \
  --entrypoint npm \
  docker.n8n.io/n8nio/n8n:2.13.4 \
  install github:nickovall/n8n-nodes-telepilot --ignore-scripts \
  --prefix /home/node/.n8n/nodes
```

Enable community packages in n8n:

```yaml
environment:
  - N8N_COMMUNITY_PACKAGES_ENABLED=true
```

Then restart n8n.

## Rebuild TDLib

The verified Alpine/musl build was produced from official `tdlib/td` source commit
`66234ae2537a99ec0eaf7b0857245a6e5c2d2bc9`.

Verified musl SHA256:

```text
9f9817d0909fbe6db6c056a5f3b5ead043240565d756858021d68d26cf418fde
```

Build helper repository:

```bash
git clone https://github.com/nickovall/tdlib-binaries-prebuilt
cd tdlib-binaries-prebuilt

docker run --rm \
  -v "$(pwd):/rep" \
  --platform linux/amd64 \
  alpine:3.16 \
  sh /rep/prebuilt-tdlib-docker.sh
```

Expected output:

```text
prebuilds/lib/libtdjson.so
```

## Development

```bash
npm ci --ignore-scripts
npm run lint
npm run build
npm pack --dry-run
```

`dist/` is committed intentionally so GitHub installs with `--ignore-scripts` can load the n8n nodes
without running a build step.

## Security notes

- `@telepilotco/tdl` still ships a vendor-provided native `.node` addon.
- `@telepilotco/tdlib-binaries-prebuilt` is not installed by this package; supply `libtdjson.so`
  manually.
- Keep `DEBUG=telepilot-*` disabled in production unless you are actively troubleshooting.

See [SECURITY.md](SECURITY.md) for the audit notes.

## License

Open source under the MIT license. Portions were originally based on the MIT-licensed
`@telepilotco/n8n-nodes-telepilot` codebase.
