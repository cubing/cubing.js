import glob from "glob";

export function getEntryPoints() {
  return glob.sync("src/sites/**/*.ts");
}
