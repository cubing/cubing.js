import { default as fetch } from "node-fetch";
import * as assert from "node:assert";
import { readFile } from "node:fs/promises";
import { execPromise, execPromiseLogged } from "../lib/execPromise.js";
import { rsync } from "./rsync.js";

const gitDescribeVersion = (await execPromise("git describe --tags")).trim();
const versionFolderName = (
  await execPromise(
    `date "+%Y-%m-%d@%H-%M-%S-%Z@${gitDescribeVersion}@unixtime%s"`,
  )
).trim();
const twizzleSSHServer = "cubing_deploy@twizzle.net";
const twizzleSFTPPath = "~/alpha.twizzle.net";
const twizzleSFTPVersionsPath = "~/_deploy-versions/alpha.twizzle.net";
const twizzleSFTPVersionPath = `${twizzleSFTPVersionsPath}/${versionFolderName}`;
const twizzleSFTPUploadPath = `${twizzleSFTPVersionsPath}/rsync-incomplete/${versionFolderName}`;
const twizzleURL = "https://alpha.twizzle.net/";

await execPromiseLogged(
  `ssh "${twizzleSSHServer}" "mkdir -p ${twizzleSFTPUploadPath} && [ ! -d ${twizzleSFTPPath} ] || { cp -R ${twizzleSFTPPath}/* ${twizzleSFTPUploadPath} && rm -f ${twizzleSFTPUploadPath}/deploy-versions }"`,
);

function ensureTrailingSlash(path) {
  return path + path.endsWith("/") ? "" : "/";
}

await rsync(
  "./dist/sites/alpha.twizzle.net/",
  `${twizzleSSHServer}:${twizzleSFTPUploadPath}/`,
  { exclude: [".DS_Store", ".git"], delete: true },
);

await execPromiseLogged(
  `ssh "${twizzleSSHServer}" "mkdir -p ${twizzleSFTPVersionsPath} && mv ${twizzleSFTPUploadPath} ${twizzleSFTPVersionPath} && ln -s ${twizzleSFTPVersionsPath} ${twizzleSFTPVersionPath}/deploy-versions && rm ${twizzleSFTPPath} && ln -s ${twizzleSFTPVersionPath} ${twizzleSFTPPath}"`,
);

const response = await fetch("https://alpha.twizzle.net/version.json");
const responseJSON = await response.json();

const distVersionJSON = JSON.parse(
  await readFile("./dist/sites/alpha.twizzle.net/version.json", "utf-8"),
);
assert.equal(
  distVersionJSON.gitDescribeVersion,
  responseJSON.gitDescribeVersion,
);
assert.equal(200, (await fetch("https://alpha.twizzle.net/edit/")).status);
assert.equal(200, (await fetch("https://alpha.twizzle.net/explore/")).status);
assert.equal(
  404,
  (await fetch("https://alpha.twizzle.net/bogus-deploy-test-url/")).status,
);

console.log(`Done deploying. Go to: ${twizzleURL}`);
