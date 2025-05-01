import { barelyServe } from "barely-a-dev-server";
import { $ } from "bun";
import type { Plugin } from "esbuild";
import { exec } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { needPath } from "../../lib/needPath";

needPath(
  fileURLToPath(
    new URL("../../../node_modules/barely-a-dev-server", import.meta.url),
  ),
  "make setup",
);

function plugins(dev: boolean) {
  const plugins = [];
  // TODO: convenience hack for @lgarron; figure out how to either generalize this or add light auto-refresh to `barely-a-dev-server`
  if (
    dev &&
    process.env["EXPERIMENTAL_CUBING_JS_RELOAD_CHROME_MACOS"] === "1"
  ) {
    console.log(
      "\nEXPERIMENTAL_CUBING_JS_RELOAD_CHROME_MACOS is set. In dev mode, the current Chrome tab (if it begins with `http://[cubing.]localhost`) will refresh after every build.\n",
    );
    plugins.push({
      name: "refresh",
      setup(build) {
        build.onEnd(() => {
          exec(
            `osascript -e 'tell application "Google Chrome"
              set theURL to get URL of the active tab of its first window
              if theURL starts with "http://localhost" then
                tell the active tab of its first window to reload
              end if
              if theURL starts with "http://cubing.localhost" then
                tell the active tab of its first window to reload
              end if
            end tell'`,
          );
        });
      },
    } satisfies Plugin);
  }
  return plugins;
}

export interface VersionJSON {
  gitDescribeVersion: string;
  gitBranch: string;
  date: string;
  commitHash: string;
  commitGitHubURL: string;
}

async function writeVersionJSON(siteFolder: string) {
  // https://git-scm.com/docs/git-describe
  const gitDescribeVersion = (
    await $`git describe --tags || echo v0.0.0`.text()
  ).trim();
  const gitBranch = (await $`git rev-parse --abbrev-ref HEAD`.text()).trim();
  const date = (await $`date`.text()).trim();
  const commitHash = (await $`git rev-parse HEAD`.text()).trim();
  const commitGitHubURL = `https://github.com/cubing/cubing.js/commit/${commitHash}`;

  await writeFile(
    join(siteFolder, "version.json"),
    JSON.stringify(
      {
        gitDescribeVersion,
        gitBranch,
        date,
        commitHash,
        commitGitHubURL,
      } satisfies VersionJSON,
      null,
      "  ",
    ),
  );
}

export async function barelyServeSite(srcFolder: string, dev: boolean) {
  const outDir = dev ? join(".temp/dev", srcFolder) : join("dist", srcFolder);
  await barelyServe({
    entryRoot: join("src", srcFolder),
    outDir,
    dev,
    devDomain: "cubing.localhost",
    port: 3333,
    esbuildOptions: {
      chunkNames: "chunks/[name]-[hash]",
      target: "es2022",
      plugins: plugins(dev),
      minify: !dev,
    },
  });
  if (!dev) {
    // TODO: Include this in the custom build process.
    await writeVersionJSON("dist/sites/alpha.twizzle.net");
  }
}
