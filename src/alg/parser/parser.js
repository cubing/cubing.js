// Workaround per https://github.com/pegjs/pegjs/pull/481
import parser from "./parser.pegjs";
const {parse} = parser;
export {parse};
