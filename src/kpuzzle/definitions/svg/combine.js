const fs = require("fs");
const path = require("path");

fs.readdir(__dirname, function(err, items) {
  const svgFilenames = items.filter((item) => item.endsWith(".svg"));
  const output = {}
  for (const svgFilename of svgFilenames) {
    output[svgFilename] = fs.readFileSync(path.join(__dirname, svgFilename)).toString();
  };
  console.log(output);
  fs.writeFileSync(path.join(__dirname, "index.json"), JSON.stringify(output, null, "  "));
});
