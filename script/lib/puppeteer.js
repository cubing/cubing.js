import { execPromise } from "./execPromise.js";

export async function ensureChromiumDownload() {
  await execPromise("node node_modules/puppeteer/install.js");
}
