import assert from "node:assert/strict";
import test from "node:test";

import worker from "../infrastructure/oauth-worker/worker.mjs";

const env = {
  ADMIN_ORIGIN: "https://www.ccfscu.com",
  GITHUB_REPOSITORY: "ccf-scu/ccfscu-website-source",
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
    new Request(`${env.OAUTH_BASE_URL}/auth?provider=github&site_id=https://www.ccfscu.com/admin/`),
    env,
  );
  assert.equal(response.status, 503);
});

test("OAuth Worker accepts Decap's hostname-only site_id", async () => {
  const response = await worker.fetch(
    new Request(`${env.OAUTH_BASE_URL}/auth?provider=github&site_id=www.ccfscu.com`),
    { ...env, GITHUB_OAUTH_ID: "test-client", GITHUB_OAUTH_SECRET: "test-secret" },
  );
  assert.equal(response.status, 302);
  assert.equal(new URL(response.headers.get("Location")).origin, "https://github.com");
});

test("OAuth Worker generates a scoped GitHub redirect and state cookie", async () => {
  const response = await worker.fetch(
    new Request(`${env.OAUTH_BASE_URL}/auth?provider=github&site_id=https://www.ccfscu.com/admin/`),
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

test("GitHub API proxy answers trusted CORS preflight requests", async () => {
  const response = await worker.fetch(
    new Request(`${env.OAUTH_BASE_URL}/github/repos/${env.GITHUB_REPOSITORY}/git/blobs`, {
      method: "OPTIONS",
      headers: { Origin: env.ADMIN_ORIGIN },
    }),
    env,
  );
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), env.ADMIN_ORIGIN);
  assert.match(response.headers.get("Access-Control-Allow-Methods"), /POST/);
});

test("GitHub API proxy rejects requests for other repositories", async () => {
  const response = await worker.fetch(
    new Request(`${env.OAUTH_BASE_URL}/github/repos/attacker/example/git/blobs`, {
      headers: { Origin: env.ADMIN_ORIGIN, Authorization: "token test" },
    }),
    env,
  );
  assert.equal(response.status, 403);
});

test("GitHub API proxy forwards media blob writes without exposing another repository", async () => {
  const originalFetch = globalThis.fetch;
  let forwarded;
  globalThis.fetch = async (input, init) => {
    forwarded = { input, init };
    return Response.json({ sha: "uploaded-sha" }, { status: 201, headers: { ETag: "test-etag" } });
  };

  try {
    const response = await worker.fetch(
      new Request(`${env.OAUTH_BASE_URL}/github/repos/${env.GITHUB_REPOSITORY}/git/blobs`, {
        method: "POST",
        headers: {
          Origin: env.ADMIN_ORIGIN,
          Authorization: "token test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: "aW1hZ2U=", encoding: "base64" }),
      }),
      env,
    );
    assert.equal(response.status, 201);
    assert.equal(response.headers.get("Access-Control-Allow-Origin"), env.ADMIN_ORIGIN);
    assert.equal(forwarded.input, `https://api.github.com/repos/${env.GITHUB_REPOSITORY}/git/blobs`);
    assert.equal(forwarded.init.headers.get("Authorization"), "token test-token");
    assert.equal(forwarded.init.method, "POST");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
