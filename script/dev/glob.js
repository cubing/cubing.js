import * as glob from "glob";

export function getEntryPoints() {
  files = glob.sync("src/sites/**/*.ts");
}
