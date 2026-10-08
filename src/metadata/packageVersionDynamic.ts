import { default as packageJSON } from "../../package.json" with {
  type: "json",
};

const { version } = packageJSON;

export { version };
