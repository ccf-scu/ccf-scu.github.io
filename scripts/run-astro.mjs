import { spawn } from "node:child_process";
import { resolve } from "node:path";

const child = spawn(process.execPath, [resolve("node_modules/astro/bin/astro.mjs"), ...process.argv.slice(2)], {
  stdio: "inherit",
  env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
