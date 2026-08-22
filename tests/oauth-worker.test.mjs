import assert from "node:assert/strict";
import test from "node:test";

import worker from "../infrastructure/oauth-worker/worker.mjs";

const env = {
  ADMIN_ORIGIN: "https://ccf-scu.github.io",
  GITHUB_REPOSITORY: "ccf-scu/ccf-scu.github.io",
  OAUTH_BASE_URL: "https://ccf-scu-cms-oauth.1632145935.workers.dev",
};

test("OAuth Worker exposes a secret-free health check", async () => {
  const response = await worker.fetch(new Request(`${env.OAUTH_BASE_URL}/health`), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok", configured: false });
});

test("OAuth Worker rejects auth requests from an untrusted CMS", async () => {
  const response = await worker.fetch(
    new Request(`${env.OAUTH_BASE_URL}/auth?provider=github&site_id=https://attacker.example`),
    env,
  );
  assert.equal(response.status, 403);
});

test("OAuth Worker fails closed while GitHub secrets are absent", async () => {
  const response = await worker.fetch(
    new Request(`${env.OAUTH_BASE_URL}/auth?provider=github&site_id=https://ccf-scu.github.io/admin/`),
    env,
  );
  assert.equal(response.status, 503);
});

test("OAuth Worker accepts Decap's hostname-only site_id", async () => {
  const response = await worker.fetch(
    new Request(`${env.OAUTH_BASE_URL}/auth?provider=github&site_id=ccf-scu.github.io`),
    { ...env, GITHUB_OAUTH_ID: "test-client", GITHUB_OAUTH_SECRET: "test-secret" },
  );
  assert.equal(response.status, 302);
  assert.equal(new URL(response.headers.get("Location")).origin, "https://github.com");
});

test("OAuth Worker generates a scoped GitHub redirect and state cookie", async () => {
  const response = await worker.fetch(
    new Request(`${env.OAUTH_BASE_URL}/auth?provider=github&site_id=https://ccf-scu.github.io/admin/`),
    { ...env, GITHUB_OAUTH_ID: "test-client", GITHUB_OAUTH_SECRET: "test-secret" },
  );
  assert.equal(response.status, 302);
  const location = new URL(response.headers.get("Location"));
  assert.equal(location.origin, "https://github.com");
  assert.equal(location.pathname, "/login/oauth/authorize");
  assert.equal(location.searchParams.get("client_id"), "test-client");
  assert.equal(location.searchParams.get("scope"), "public_repo");
  assert.equal(location.searchParams.get("redirect_uri"), `${env.OAUTH_BASE_URL}/callback`);
  assert.match(response.headers.get("Set-Cookie"), /HttpOnly; Secure; SameSite=Lax/);
});

test("OAuth Worker rejects callbacks without matching state", async () => {
  const response = await worker.fetch(
    new Request(`${env.OAUTH_BASE_URL}/callback?code=example&state=bad`),
    { ...env, GITHUB_OAUTH_ID: "test-client", GITHUB_OAUTH_SECRET: "test-secret" },
  );
  assert.equal(response.status, 400);
});
