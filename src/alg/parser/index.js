// Workaround per https://github.com/pegjs/pegjs/pull/481
import parser from "./parser-source.pegjs";
const {parse} = parser;
export {parse};
