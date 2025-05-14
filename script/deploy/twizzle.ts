import * as assert from "node:assert";
import { readFile } from "node:fs/promises";
import { $ } from "bun";
import { PrintableShellCommand } from "printable-shell-command";
import type { VersionJSON } from "../build/sites/barelyServeSite";
import { rsync } from "./rsync";

const gitDescribeVersion = (await $`git describe --tags`.text()).trim();
const versionFolderName = (
  await $`date "+%Y-%m-%d@%H-%M-%S-%Z@${gitDescribeVersion}@unixtime%s"`.text()
).trim();
const twizzleSSHServer = "cubing_deploy@twizzle.net";
const twizzleSFTPPath = "~/alpha.twizzle.net";
const twizzleSFTPVersionsPath = "~/_deploy-versions/alpha.twizzle.net";
const twizzleSFTPVersionPath = `${twizzleSFTPVersionsPath}/${versionFolderName}`;
const twizzleSFTPUploadPath = `${twizzleSFTPVersionsPath}/rsync-incomplete/${versionFolderName}`;
const twizzleURL = "https://alpha.twizzle.net/";

await new PrintableShellCommand("ssh", [
  twizzleSSHServer,
  // TODO: implement escaping in `PrintableShellCommand`.
  `mkdir -p ${twizzleSFTPUploadPath} && [ ! -d ${twizzleSFTPPath} ] || { cp -R ${twizzleSFTPPath}/* ${twizzleSFTPUploadPath} && rm -f ${twizzleSFTPUploadPath}/deploy-versions }`,
]).shellOutBun();

await rsync(
  "./dist/sites/alpha.twizzle.net/",
  `${twizzleSSHServer}:${twizzleSFTPUploadPath}/`,
  { exclude: [".DS_Store", ".git"], delete: true },
);

await new PrintableShellCommand("ssh", [
  twizzleSSHServer,
  // TODO: implement escaping in `PrintableShellCommand`.
  `mkdir -p ${twizzleSFTPVersionsPath} && mv ${twizzleSFTPUploadPath} ${twizzleSFTPVersionPath} && ln -s ${twizzleSFTPVersionsPath} ${twizzleSFTPVersionPath}/deploy-versions && rm ${twizzleSFTPPath} && ln -s ${twizzleSFTPVersionPath} ${twizzleSFTPPath}`,
]).shellOutBun();

const response = await fetch("https://alpha.twizzle.net/version.json");
const responseJSON = (await response.json()) as VersionJSON;

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
