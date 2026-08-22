const STATE_COOKIE = "ccf_scu_oauth_state";
const STATE_TTL_SECONDS = 600;
const MAX_TOKEN_RESPONSE_BYTES = 16 * 1024;
const GITHUB_API_PREFIX = "/github";

function corsHeaders(adminOrigin) {
  return {
    "Access-Control-Allow-Origin": adminOrigin,
    "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Accept, Authorization, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, X-GitHub-Api-Version",
    "Access-Control-Expose-Headers": "Content-Length, Content-Type, ETag, Link, Location, Retry-After, X-GitHub-Request-Id, X-OAuth-Scopes, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-RateLimit-Used",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function securityHeaders(extra = {}) {
  return {
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    ...extra,
  };
}

function textResponse(message, status = 200, extraHeaders = {}) {
  return new Response(message, {
    status,
    headers: securityHeaders({
      "Content-Type": "text/plain; charset=utf-8",
      ...extraHeaders,
    }),
  });
}

function randomHex(bytes) {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return Array.from(buffer, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function cookieValue(request, name) {
  const cookie = request.headers.get("Cookie") ?? "";
  for (const part of cookie.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    if (part.slice(0, separator).trim() === name) {
      return decodeURIComponent(part.slice(separator + 1).trim());
    }
  }
  return null;
}

function stateCookie(value, maxAge = STATE_TTL_SECONDS) {
  return `${STATE_COOKIE}=${encodeURIComponent(value)}; Path=/callback; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

function requestComesFromAdmin(request, url, adminOrigin) {
  const siteId = url.searchParams.get("site_id");
  if (siteId) {
    const expectedOrigin = new URL(adminOrigin);
    if (siteId === expectedOrigin.hostname || siteId === expectedOrigin.host) return true;
    try {
      if (new URL(siteId).origin === expectedOrigin.origin) return true;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get("Referer");
  if (!referer) return false;
  try {
    return new URL(referer).origin === adminOrigin;
  } catch {
    return false;
  }
}

function callbackUrl(env) {
  return new URL("/callback", env.OAUTH_BASE_URL).href;
}

async function exchangeCode(code, env) {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "ccf-scu-cms-oauth",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_OAUTH_ID,
      client_secret: env.GITHUB_OAUTH_SECRET,
      code,
      redirect_uri: callbackUrl(env),
    }),
  });

  const contentLength = Number(response.headers.get("Content-Length") ?? "0");
  if (contentLength > MAX_TOKEN_RESPONSE_BYTES) {
    throw new Error("GitHub token response was unexpectedly large");
  }

  const body = await response.json();
  if (!response.ok || typeof body?.access_token !== "string" || !body.access_token) {
    throw new Error(`GitHub token exchange failed with status ${response.status}`);
  }
  return body.access_token;
}

async function hasRepositoryWriteAccess(token, repository) {
  const response = await fetch(`https://api.github.com/repos/${repository}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "ccf-scu-cms-oauth",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) return false;
  const body = await response.json();
  return body?.permissions?.push === true;
}

function callbackPage(status, payload, adminOrigin) {
  const nonce = randomHex(16);
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
  const safeMessage = JSON.stringify(message).replaceAll("<", "\\u003c");
  const safeOrigin = JSON.stringify(adminOrigin).replaceAll("<", "\\u003c");
  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>CCF SCU CMS 登录</title>
  </head>
  <body>
    <p>正在完成 Decap CMS 登录，请稍候……</p>
    <script nonce="${nonce}">
      const targetOrigin = ${safeOrigin};
      const payload = ${safeMessage};
      const openerWindow = window.opener;
      const receiveMessage = (event) => {
        if (!openerWindow || event.source !== openerWindow || event.origin !== targetOrigin) return;
        openerWindow.postMessage(payload, targetOrigin);
        window.removeEventListener("message", receiveMessage);
        window.close();
      };
      window.addEventListener("message", receiveMessage);
      if (openerWindow) openerWindow.postMessage("authorizing:github", targetOrigin);
    </script>
  </body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: securityHeaders({
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
      "Set-Cookie": stateCookie("", 0),
      "X-Frame-Options": "DENY",
    }),
  });
}

async function handleAuth(request, url, env) {
  if (url.searchParams.get("provider") !== "github") {
    return textResponse("Invalid provider", 400);
  }
  if (!requestComesFromAdmin(request, url, env.ADMIN_ORIGIN)) {
    return textResponse("Untrusted CMS origin", 403);
  }
  if (!env.GITHUB_OAUTH_ID || !env.GITHUB_OAUTH_SECRET) {
    return textResponse("OAuth service is not configured", 503);
  }

  const state = randomHex(32);
  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.search = new URLSearchParams({
    client_id: env.GITHUB_OAUTH_ID,
    redirect_uri: callbackUrl(env),
    response_type: "code",
    scope: "public_repo",
    state,
  }).toString();

  return new Response(null, {
    status: 302,
    headers: securityHeaders({
      Location: authorizeUrl.href,
      "Set-Cookie": stateCookie(state),
    }),
  });
}

async function handleCallback(request, url, env) {
  const returnedState = url.searchParams.get("state");
  const expectedState = cookieValue(request, STATE_COOKIE);
  if (
    !returnedState ||
    !expectedState ||
    !/^[a-f0-9]{64}$/.test(returnedState) ||
    returnedState !== expectedState
  ) {
    return textResponse("Invalid or expired OAuth state", 400, {
      "Set-Cookie": stateCookie("", 0),
    });
  }

  const oauthError = url.searchParams.get("error");
  if (oauthError) {
    return callbackPage("error", { message: "GitHub authorization was declined" }, env.ADMIN_ORIGIN);
  }
  const code = url.searchParams.get("code");
  if (!code) return textResponse("Missing authorization code", 400);

  const token = await exchangeCode(code, env);
  if (!(await hasRepositoryWriteAccess(token, env.GITHUB_REPOSITORY))) {
    return callbackPage("error", { message: "This GitHub account cannot write to the website repository" }, env.ADMIN_ORIGIN);
  }
  return callbackPage("success", { token }, env.ADMIN_ORIGIN);
}

function isTrustedAdminOrigin(request, adminOrigin) {
  return request.headers.get("Origin") === adminOrigin;
}

function githubApiPath(url, repository) {
  const path = url.pathname.slice(GITHUB_API_PREFIX.length) || "/";
  const repositoryPrefix = `/repos/${repository}`;
  if (path === "/user" || path === repositoryPrefix || path.startsWith(`${repositoryPrefix}/`)) {
    return `${path}${url.search}`;
  }
  return null;
}

async function handleGitHubApi(request, url, env) {
  const cors = corsHeaders(env.ADMIN_ORIGIN);
  if (request.method === "OPTIONS") {
    if (!isTrustedAdminOrigin(request, env.ADMIN_ORIGIN)) return textResponse("Untrusted CMS origin", 403);
    return new Response(null, { status: 204, headers: securityHeaders(cors) });
  }
  if (!isTrustedAdminOrigin(request, env.ADMIN_ORIGIN)) {
    return textResponse("Untrusted CMS origin", 403, cors);
  }
  const authorization = request.headers.get("Authorization");
  if (!authorization) return textResponse("Missing GitHub authorization", 401, cors);

  const apiPath = githubApiPath(url, env.GITHUB_REPOSITORY);
  if (!apiPath) return textResponse("GitHub API path is outside the CMS repository", 403, cors);

  const headers = new Headers();
  for (const name of [
    "Accept",
    "Authorization",
    "Content-Type",
    "If-Match",
    "If-Modified-Since",
    "If-None-Match",
    "If-Unmodified-Since",
    "X-GitHub-Api-Version",
  ]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("User-Agent", "ccf-scu-cms-api-proxy");
  headers.set("X-GitHub-Api-Version", headers.get("X-GitHub-Api-Version") || "2022-11-28");

  const response = await fetch(`https://api.github.com${apiPath}`, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  });
  const responseHeaders = new Headers(response.headers);
  for (const [name, value] of Object.entries(cors)) responseHeaders.set(name, value);
  responseHeaders.set("Cache-Control", "no-store");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname === GITHUB_API_PREFIX || url.pathname.startsWith(`${GITHUB_API_PREFIX}/`)) {
        return await handleGitHubApi(request, url, env);
      }
      if (request.method !== "GET") return textResponse("Method not allowed", 405, { Allow: "GET" });
      if (url.pathname === "/auth") return await handleAuth(request, url, env);
      if (url.pathname === "/callback") return await handleCallback(request, url, env);
      if (url.pathname === "/health") {
        return Response.json(
          { status: "ok", configured: Boolean(env.GITHUB_OAUTH_ID && env.GITHUB_OAUTH_SECRET) },
          { headers: securityHeaders() },
        );
      }
      return textResponse("CCF SCU CMS OAuth service");
    } catch (error) {
      console.error(JSON.stringify({
        event: "oauth_request_failed",
        path: url.pathname,
        message: error instanceof Error ? error.message : "Unknown error",
      }));
      const extraHeaders = url.pathname.startsWith(`${GITHUB_API_PREFIX}/`)
        ? corsHeaders(env.ADMIN_ORIGIN)
        : {};
      return textResponse("OAuth request failed", 502, {
        ...extraHeaders,
        "Set-Cookie": stateCookie("", 0),
      });
    }
  },
};
