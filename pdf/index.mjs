import { build } from "vite";
import { resolve } from "path";
import { spawnSync } from "child_process";

(async () => {
  await build({ configFile: resolve("pdf/vite.config.ts") });
  spawnSync("node", ["pdf/dist"], { stdio: "inherit" });
})();
