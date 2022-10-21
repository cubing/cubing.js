import { rsync } from "./rsync";

const typedocSFTPPath =
  "cubing_deploy@towns.dreamhost.com:~/experiments.cubing.net/cubing.js-typedoc/";
const typedocURL = "https://experiments.cubing.net/cubing.js-typedoc/";

await rsync("./dist/sites/typedoc/", typedocSFTPPath);
console.log(`Done deploying. Go to: ${typedocURL}`);
