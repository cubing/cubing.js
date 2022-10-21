import { rsync } from "./rsync.js";

const experimentsSFTPPath =
  "cubing_deploy@towns.dreamhost.com:~/experiments.cubing.net/cubing.js";
const experimentsURL = "https://experiments.cubing.net/cubing.js/";

await rsync(
  "./dist/sites/experiments.cubing.net/cubing.js/",
  experimentsSFTPPath,
);
console.log(`Done deploying. Go to: ${experimentsURL}`);
