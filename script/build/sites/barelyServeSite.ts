import { env } from "node:process";
import { barelyServe } from "barely-a-dev-server";
import type { Plugin } from "esbuild";
import { Path } from "path-class";
import { PrintableShellCommand } from "printable-shell-command";
import { needPath } from "../../lib/needPath";

await needPath(
  Path.resolve("../../../node_modules/barely-a-dev-server", import.meta.url),
  "make setup",
);

function plugins(dev: boolean): Plugin[] {
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
          new PrintableShellCommand("osascript", [
            [
              "-e",
              `
tell application "Google Chrome"
  set theURL to get URL of the active tab of its first window
  if theURL starts with "http://localhost" then
    tell the active tab of its first window to reload
  end if
  if theURL starts with "http://cubing.localhost" then
    tell the active tab of its first window to reload
  end if
end tell`,
            ],
          ]);
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

async function writeVersionJSON(siteFolder: Path) {
  // https://git-scm.com/docs/git-describe
  console.log("writeVersionJSON");
  const gitDescribeVersion = await (async () => {
    try {
      const subprocess = new PrintableShellCommand("git", [
        "describe",
        "--tags",
      ]).spawn({ stdio: ["ignore", "pipe", "ignore"] });
      const text = subprocess.stdout.text({
        trimTrailingNewlines: "single-required",
      });
      if ((await subprocess.exitCodePromise) !== 0) {
        if (env["CI"]) {
          return "(unknown due to CI also)";
        }
      }
      return await text;
    } catch (e) {
      console.log("caught");
      console.log(`env["CI"]: `, env["CI"]);
      console.log(`env: `, env);
      if (env["CI"]) {
        return "(unknown due to CI)";
      }
      throw e;
    }
  })();
  const gitBranch = await new PrintableShellCommand("git", [
    "rev-parse",
    "--abbrev-ref",
    "HEAD",
  ]).text({
    trimTrailingNewlines: "single-required",
  });
  const date = await new PrintableShellCommand("date", []).text({
    trimTrailingNewlines: "single-required",
  });
  const commitHash = await new PrintableShellCommand("git", [
    "rev-parse",
    "HEAD",
  ]).text({
    trimTrailingNewlines: "single-required",
  });
  const commitGitHubURL = `https://github.com/cubing/cubing.js/commit/${commitHash}`;

  await siteFolder.join("version.json").writeJSON({
    gitDescribeVersion,
    gitBranch,
    date,
    commitHash,
    commitGitHubURL,
  } satisfies VersionJSON);
}

export async function barelyServeSite(srcFolder: string, dev: boolean) {
  const outDir = new Path(dev ? ".temp/dev" : "dist").join(srcFolder);
  await barelyServe({
    entryRoot: new Path("src").join(srcFolder).path,
    outDir: outDir.path, // TODO: accept `Path` arg in the `barelyServe(…)` signature?
    dev,
    devDomain: "cubing.localhost",
    port: 3333,
    esbuildOptions: {
      chunkNames: "chunks/[name]-[hash]",
      target: "es2022",
      plugins: plugins(dev),
    },
  });
  if (!dev) {
    // TODO: Include this in the custom build process.
    await writeVersionJSON(new Path("dist/sites/alpha.twizzle.net"));
  }
}
