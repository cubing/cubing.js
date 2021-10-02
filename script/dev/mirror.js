import { watchDirectoriesForChangesAndMirror } from "mirror-directories";

export async function mirror() {
  const _stopWatching = await watchDirectoriesForChangesAndMirror(
    [
      {
        srcDirs: ["src/sites", "dist/dev/esbuild"],
        destDirs: ["dist/dev/serve"],
      },
    ],
    {
      // watchProject: true,
      rename: true,
    },
  );
}
