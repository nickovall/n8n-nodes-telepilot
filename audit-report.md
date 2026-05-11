# audit-report.md

_Audit date: 2026-05-11_
_Audited package: @telepilotco/n8n-nodes-telepilot v0.5.2_
_Files audited: credentials/ (1 file), nodes/ (6 files), dist/ (not present), node_modules/@telepilotco/ (not installed)_

---

### CLEAN

- file: `nodes/TelePilot/TelePilot.node.ts`, reason: no suspicious patterns found — all network calls go through `client.invoke()` (TDLib API), all URLs are `https://telepilot.co/login-howto` returned as user-facing strings (not runtime HTTP calls), `require('fs')` used for file-existence checks only
- file: `nodes/TelePilot/TelePilotTrigger.node.ts`, reason: only attaches event listeners to TDLib client, emits events through n8n framework, no outbound HTTP
- file: `nodes/TelePilot/common.descriptions.ts`, reason: static UI field definitions only, `https://t.me/...` is a placeholder string for a UI input field
- file: `nodes/TelePilot/tdlib/types.ts`, reason: TypeScript type definitions, no runtime code
- file: `nodes/TelePilot/tdlib/updateEvents.ts`, reason: static array of TDLib event names, no runtime code
- file: `nodes/TelePilot/TelePilot.node.json`, reason: static node description JSON, documentation URLs only
- file: `package.json`, reason: no `preinstall`, `postinstall`, or `prepare` scripts defined

---

### SUSPICIOUS

- **file:** `credentials/TelePilotApi.credentials.ts`, **line:** 41, **pattern:** Non-Telegram external HTTP endpoint in credential test handler
  - **context:**
    ```ts
    test: ICredentialTestRequest = {
        request: {
            baseURL: 'http://ls.telepilot.co:4413',   // line 41
            url: '?key=empty',
            method: 'POST',
        },
    };
    ```
  - **analysis:** When a user clicks "Test Credentials" in the n8n UI, n8n executes this `ICredentialTestRequest` and sends a POST to `http://ls.telepilot.co:4413/?key=empty`. This is:
    1. A vendor-controlled server (not Telegram). The subdomain `ls` + non-standard port 4413 is consistent with a "license server".
    2. Plain HTTP (not HTTPS) — any data sent is transmitted unencrypted.
    3. The credential type defines `apiId`, `apiHash`, and `phoneNumber` properties. No `authenticate` property is defined, so n8n _may_ not inject these values into the request automatically — but this cannot be confirmed without running the code.
    4. The `?key=empty` URL parameter is anomalous — it suggests the key is expected to have a real value in other contexts.
  - **verdict contribution:** SUSPICIOUS — not proven exfiltration, but an unexpected outbound call to a non-Telegram server during credential testing with no HTTPS and unclear purpose.

- **file:** `nodes/TelePilot/TelePilotNodeConnectionManager.ts`, **lines:** 64-65, **pattern:** `process.env.HOME`
  - **context:**
    ```ts
    private TD_DATABASE_PATH_PREFIX = process.env.HOME + "/.n8n/nodes/node_modules/@telepilotco/n8n-nodes-telepilot/db"
    private TD_FILES_PATH_PREFIX = process.env.HOME + "/.n8n/nodes/node_modules/@telepilotco/n8n-nodes-telepilot/db"
    ```
  - **analysis:** `process.env.HOME` is used to construct the local TDLib database path. This is legitimate use — reading the home directory to locate the n8n data folder. No data is sent anywhere using this value. **Not a security concern.**

- **file:** `nodes/TelePilot/TelePilotNodeConnectionManager.ts`, **line:** 6, **pattern:** Commented-out `child_process` import
  - **context:** `// const childProcess = require('child_process');`
  - **analysis:** Dead code — commented out and not used anywhere. No `exec(` or `spawn(` calls present anywhere in the codebase. **Not a security concern.**

---

### Additional observations

- `dist/` directory is not present in this worktree. The compiled JS output was not audited. If the published npm package ships compiled JS, the compiled output should be verified to match what TypeScript produces from these sources.
- `node_modules/@telepilotco/` is not installed in this worktree. The binary and tdl packages' install scripts could not be inspected directly — see dependency-report.md for details.
- All TDLib API calls flow through `client.invoke()` which is the standard TDLib MTProto interface. No evidence of secondary exfiltration channels.
- `require('fs')` and `require('fs/promises')` are used for local file operations (file existence check, database directory removal). These are scoped to local paths only.

---

### VERDICT

**SUSPICIOUS**

**Primary reason:** `credentials/TelePilotApi.credentials.ts:41` — outbound POST to `http://ls.telepilot.co:4413` (vendor-controlled, non-Telegram, plain HTTP) on credential test. Purpose is unverified. This requires network-level inspection or source inspection of that server before trust can be established.

**Recommended action before production deployment:** Monitor network traffic during credential testing to confirm what data (if any) is sent to `ls.telepilot.co:4413`. If any credential fields are included in the request body, this would escalate to CRITICAL.
