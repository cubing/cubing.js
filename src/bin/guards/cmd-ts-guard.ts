import { exit } from "node:process";

try {
  await import("cmd-ts");
} catch (e) {
  // Note that this doesn't fail when installed using `bun install --global`, as `bun` automatically loads deps.
  console.error(
    `Could not import \`cmd-ts\`. This is not automatically installed as a regular dependency of \`cubing\`.

If you are installing globally, consider using \`bun\`: https://bun.sh/

    bun install --global cubing

If you are installing using \`npx\` globally, run:

    npm install --global cubing cmd-ts

If you are using \`npx\` within a repo, run:

    npm install cubing cmd-ts
`,
  );
  exit(1);
}
