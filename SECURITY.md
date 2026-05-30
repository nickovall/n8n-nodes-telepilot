# Security Notes

Audit scope: `@telepilotco/n8n-nodes-telepilot` upstream version `0.5.2`, forked in May 2026.

## Fixed

### Removed vendor credential-test request

Upstream credentials included a `test` request that posted to:

```text
http://ls.telepilot.co:4413/?key=empty
```

That endpoint was not Telegram, used plain HTTP, and was triggered from the n8n credential test UI.
This fork removes the credential `test` block entirely. Credentials are validated only when TDLib is
used against Telegram.

### Safer runtime handling

- `api_id` is treated as a positive integer before it is used for TDLib sessions or local paths.
- TDLib session cleanup uses numeric path segments and `fs.rm(..., { recursive: true, force: true })`.
- Trigger authorization listeners are attached once per session and detached on close.
- Trigger debug logs no longer print full Telegram update payloads.
- `/cred` masks `api_hash`; `/stat` masks phone numbers.

## Remaining Supply-Chain Notes

### Removed `@telepilotco/tdlib-binaries-prebuilt`

The upstream binary package does not include `libtdjson.so` in the npm tarball. Its install script
uses `node-pre-gyp` to download from `https://telepilot.co/`, but the expected release URLs returned
404 during the audit. This fork removes that package from runtime dependencies.

Mitigation used by this fork:

- install with `--ignore-scripts`
- rebuild `libtdjson.so` from official `tdlib/td` source
- copy the rebuilt binary into
  `/home/node/.n8n/nodes/node_modules/@telepilotco/tdlib-binaries-prebuilt/prebuilds/libtdjson.so`

Verified Alpine/musl TDLib build:

```text
TDLib commit: 66234ae2537a99ec0eaf7b0857245a6e5c2d2bc9
SHA256: 9f9817d0909fbe6db6c056a5f3b5ead043240565d756858021d68d26cf418fde
```

### `@telepilotco/tdl`

`@telepilotco/tdl@7.4.1` ships prebuilt native `.node` addons in its npm tarball and uses
`node-gyp-build` as its install hook. This fork does not rebuild that addon. If you need maximum
supply-chain assurance, rebuild `@telepilotco/tdl` from source for your target platform.

## Operational Guidance

- Use a dedicated Telegram account for automation.
- Keep `--ignore-scripts` in the documented install command unless you have audited the native
  install hooks yourself.
- Keep `DEBUG=telepilot-*` disabled in production except during active troubleshooting.
- Re-copy `libtdjson.so` after reinstalling the package or rebuilding the n8n node volume.
