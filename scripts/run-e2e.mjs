import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const astro = resolve("scripts/run-astro.mjs");
const playwright = resolve("node_modules/@playwright/test/cli.js");
const env = { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" };

spawnSync(process.execPath, [astro, "dev", "stop"], { stdio: "ignore", env });
const start = spawnSync(process.execPath, [astro, "dev", "--background", "--host", "127.0.0.1", "--port", "4455"], { stdio: "inherit", env });
if (start.status !== 0) process.exit(start.status ?? 1);
try {
  const test = spawnSync(process.execPath, [playwright, "test", ...process.argv.slice(2)], { stdio: "inherit", env });
  process.exitCode = test.status ?? 1;
} finally {
  spawnSync(process.execPath, [astro, "dev", "stop"], { stdio: "inherit", env });
}
