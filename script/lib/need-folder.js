import { existsSync } from "fs";

export function needFolder(folder, cmd) {
  if (!existsSync(folder)) {
    console.error(
      `\nFolder does not exist:\n${folder}\n\nRun \`${cmd}\` first!\n\b`,
    );
    process.exit(1);
  }
}
