# Implementation Plan - Enable AUTH_SECRET Authentication

[Overview]
Enable the `AUTH_SECRET` environment variable to protect the AI proxy and data sync API endpoints from unauthorized access.

Currently, the AI proxy is open to anyone who knows the endpoint URL, and the sync API only verifies ownership via `syncId`. This plan introduces a global "Access Code" mechanism where the instance owner can set an `AUTH_SECRET` on the server, and users must provide the matching code in their settings to use the API.

[Types]
No major type system changes, but the configuration state will be extended.

- `ConfigStore.proxy`: Add `accessCode: string` field to store the user-provided secret.

[Files]
Detailed breakdown of file modifications:

- `src/store/useConfigStore.js`: Add `accessCode` to state and persistence.
- `src/services/aiService.js`: Include access token in proxy requests.
- `src/services/syncService.js`: Include access token in sync requests.
- `src/components/settings/SettingsModal.jsx`: Add UI field for Access Code.
- `src/i18n/translations/zh-CN.js`: Add translations for the new UI field.
- `api/auth.js`: Implement global secret verification for Node.js.
- `functions/api/auth.js`: Implement global secret verification for Cloudflare Workers.
- `api/ai-proxy.js`: Protect endpoint with global auth.
- `api/sync/upload.js`: Protect endpoint with global auth.
- `api/sync/download.js`: Protect endpoint with global auth.
- `api/sync/delete.js`: Protect endpoint with global auth.
- `functions/api/ai-proxy.js`: Protect endpoint with global auth.
- `functions/api/sync/[[path]].js`: Protect endpoint with global auth.

[Functions]
Detailed breakdown:

- New `verifyGlobalAuth(req/context)` in `api/auth.js` and `functions/api/auth.js`:
  - Checks if `AUTH_SECRET` env var is set.
  - If set, validates `X-Authorization` header against the secret.
  - Returns boolean or error response.
- Modified `aiService.chatCompletion`, `aiService.fetchModels`, `aiService.generateImage`:
  - Fetch `accessCode` from store and add to headers.
- Modified `syncService._buildAuthHeaders`:
  - Add `X-Authorization` header if `accessCode` exists.

[Classes]
No new classes.

[Dependencies]
No new dependencies.

[Implementation Order]
1. Update `i18n` and `ConfigStore` to support the new `accessCode` field.
2. Update the `SettingsModal` UI to allow users to input the code.
3. Update `aiService` and `syncService` to send the token in headers.
4. Implement `verifyGlobalAuth` in both Node.js and Cloudflare auth modules.
5. Apply the verification to all relevant API handlers.
6. Verify the implementation by testing with and without the secret.

task_progress Items:
- [ ] Step 1: Update i18n and ConfigStore state
- [ ] Step 2: Add Access Code input to Settings UI
- [ ] Step 3: Modify client-side services to send authentication headers
- [ ] Step 4: Implement server-side global auth verification (Node.js & Workers)
- [ ] Step 5: Protect all API endpoints with the new verification logic
