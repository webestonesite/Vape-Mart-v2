import { spawnSync } from "node:child_process";
import path from "node:path";

console.log("=== Running Vape Mart Admin Test Suite ===\n");

const rootDir = process.cwd();
const tsconfigTest = "./tests/config/tsconfig.test.json";

const testFiles = [
  "tests/admin/modular-domain.test.mjs",
  "tests/tier1-domains/orders-query.test.ts",
  "tests/tier1-domains/products-query.test.ts",
  "tests/tier1-domains/route-domain.test.ts",
];

const isWindows = process.platform === "win32";
const npxCmd = isWindows ? "npx.cmd" : "npx";

const result = spawnSync(
  npxCmd,
  ["tsx", "--tsconfig", tsconfigTest, "--test", ...testFiles],
  {
    stdio: "inherit",
    cwd: rootDir,
    shell: isWindows,
  }
);

if (result.status !== 0) {
  console.error(`\nTest run failed with exit code: ${result.status}`);
  process.exit(result.status ?? 1);
}

console.log("\nAll tests completed successfully.");
process.exit(0);
