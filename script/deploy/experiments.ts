import { rsync } from "./rsync";

const experimentsSFTPPath =
  "cubing_deploy@experiments.cubing.net:~/experiments.cubing.net/cubing.js";
const experimentsURL = "https://experiments.cubing.net/cubing.js/";

await rsync(
  "./dist/sites/experiments.cubing.net/cubing.js/",
  experimentsSFTPPath,
);
console.log(`Done deploying. Go to: ${experimentsURL}`);
