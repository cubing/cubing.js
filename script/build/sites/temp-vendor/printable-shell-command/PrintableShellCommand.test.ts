import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { createWriteStream } from "node:fs";
import { env, stderr, stdout } from "node:process";
import { Path } from "path-class";
import { PrintableShellCommand } from ".";

globalThis.process.stdout.isTTY = false;

const rsyncCommand = new PrintableShellCommand("rsync", [
  "-avz",
  ["--exclude", ".DS_Store"],
  ["--exclude", ".git"],
  "./dist/web/experiments.cubing.net/test/deploy/",
  "experiments.cubing.net:~/experiments.cubing.net/test/deploy/",
]);

test("args for commands", () => {
  expect(rsyncCommand.toCommandWithFlatArgs()).toEqual([
    "rsync",
    [
      "-avz",
      "--exclude",
      ".DS_Store",
      "--exclude",
      ".git",
      "./dist/web/experiments.cubing.net/test/deploy/",
      "experiments.cubing.net:~/experiments.cubing.net/test/deploy/",
    ],
  ]);
});

test("default formatting", () => {
  expect(rsyncCommand.getPrintableCommand()).toEqual(
    `rsync \\
  -avz \\
  --exclude .DS_Store \\
  --exclude .git \\
  ./dist/web/experiments.cubing.net/test/deploy/ \\
  experiments.cubing.net:~/experiments.cubing.net/test/deploy/`,
  );
  expect(
    rsyncCommand.getPrintableCommand({
      quoting: "auto",
      argumentLineWrapping: "by-entry",
    }),
  ).toEqual(rsyncCommand.getPrintableCommand());
});

test("extra-safe quoting", () => {
  expect(rsyncCommand.getPrintableCommand({ quoting: "extra-safe" })).toEqual(
    `'rsync' \\
  '-avz' \\
  '--exclude' '.DS_Store' \\
  '--exclude' '.git' \\
  './dist/web/experiments.cubing.net/test/deploy/' \\
  'experiments.cubing.net:~/experiments.cubing.net/test/deploy/'`,
  );
});

test("indentation", () => {
  expect(
    rsyncCommand.getPrintableCommand({ argIndentation: "\t   \t" }),
  ).toEqual(
    `rsync \\
	   	-avz \\
	   	--exclude .DS_Store \\
	   	--exclude .git \\
	   	./dist/web/experiments.cubing.net/test/deploy/ \\
	   	experiments.cubing.net:~/experiments.cubing.net/test/deploy/`,
  );
  expect(rsyncCommand.getPrintableCommand({ argIndentation: "↪ " })).toEqual(
    `rsync \\
↪ -avz \\
↪ --exclude .DS_Store \\
↪ --exclude .git \\
↪ ./dist/web/experiments.cubing.net/test/deploy/ \\
↪ experiments.cubing.net:~/experiments.cubing.net/test/deploy/`,
  );
  expect(rsyncCommand.getPrintableCommand({ mainIndentation: "  " })).toEqual(
    `  rsync \\
    -avz \\
    --exclude .DS_Store \\
    --exclude .git \\
    ./dist/web/experiments.cubing.net/test/deploy/ \\
    experiments.cubing.net:~/experiments.cubing.net/test/deploy/`,
  );
  expect(
    rsyncCommand.getPrintableCommand({
      mainIndentation: "🙈",
      argIndentation: "🙉",
    }),
  ).toEqual(
    `🙈rsync \\
🙈🙉-avz \\
🙈🙉--exclude .DS_Store \\
🙈🙉--exclude .git \\
🙈🙉./dist/web/experiments.cubing.net/test/deploy/ \\
🙈🙉experiments.cubing.net:~/experiments.cubing.net/test/deploy/`,
  );
});

test("line wrapping", () => {
  expect(
    rsyncCommand.getPrintableCommand({ argumentLineWrapping: "by-entry" }),
  ).toEqual(rsyncCommand.getPrintableCommand());
  expect(
    rsyncCommand.getPrintableCommand({
      argumentLineWrapping: "nested-by-entry",
    }),
  ).toEqual(`rsync \\
  -avz \\
  --exclude \\
    .DS_Store \\
  --exclude \\
    .git \\
  ./dist/web/experiments.cubing.net/test/deploy/ \\
  experiments.cubing.net:~/experiments.cubing.net/test/deploy/`);
  expect(
    rsyncCommand.getPrintableCommand({ argumentLineWrapping: "by-argument" }),
  ).toEqual(`rsync \\
  -avz \\
  --exclude \\
  .DS_Store \\
  --exclude \\
  .git \\
  ./dist/web/experiments.cubing.net/test/deploy/ \\
  experiments.cubing.net:~/experiments.cubing.net/test/deploy/`);
  expect(
    rsyncCommand.getPrintableCommand({
      argumentLineWrapping: "inline",
    }),
  ).toEqual(
    "rsync -avz --exclude .DS_Store --exclude .git ./dist/web/experiments.cubing.net/test/deploy/ experiments.cubing.net:~/experiments.cubing.net/test/deploy/",
  );
});

test("command with space is escaped by default", () => {
  const command = new PrintableShellCommand(
    "/Applications/My App.app/Contents/Resources/my-app",
  );

  expect(command.getPrintableCommand()).toEqual(
    `'/Applications/My App.app/Contents/Resources/my-app'`,
  );
});

test("command with equal sign is escaped by default", () => {
  const command = new PrintableShellCommand("THIS_LOOKS_LIKE_AN=env-var");

  expect(command.getPrintableCommand()).toEqual(`'THIS_LOOKS_LIKE_AN=env-var'`);
});

test("stylin'", () => {
  expect(rsyncCommand.getPrintableCommand({ style: ["gray", "bold"] })).toEqual(
    `\u001B[90m\u001B[1mrsync \\
  -avz \\
  --exclude .DS_Store \\
  --exclude .git \\
  ./dist/web/experiments.cubing.net/test/deploy/ \\
  experiments.cubing.net:~/experiments.cubing.net/test/deploy/\u001B[22m\u001B[39m`,
  );
});

test("more than 2 args in a group", () => {
  expect(
    new PrintableShellCommand("echo", [
      ["the", "rain", "in", "spain"],
      "stays",
      ["mainly", "in", "the", "plain"],
    ]).getPrintableCommand(),
  ).toEqual(
    `echo \\
  the rain in spain \\
  stays \\
  mainly in the plain`,
  );
});

test("don't line wrap after command", () => {
  expect(
    new PrintableShellCommand("echo", [
      ["the", "rain", "in", "spain"],
      "stays",
      ["mainly", "in", "the", "plain"],
    ]).getPrintableCommand({ skipLineWrapBeforeFirstArg: true }),
  ).toEqual(
    `echo the rain in spain \\
  stays \\
  mainly in the plain`,
  );
});

test("don't line wrap after command (when there are no args)", () => {
  expect(
    new PrintableShellCommand("echo", []).getPrintableCommand({
      skipLineWrapBeforeFirstArg: true,
    }),
  ).toEqual(`echo`);
});

test("Throws spawning error if the command can't be executed.", async () => {
  const binPath = (await Path.makeTempDir()).join("nonexistent.bin");
  expect(() => new PrintableShellCommand(binPath, []).text()).toThrow(
    /ENOENT|Premature close/,
  );
  await binPath.write(`#!/usr/bin/env -S bun run --

console.log("hi");`);
  expect(() => new PrintableShellCommand(binPath, []).text()).toThrow(
    /EACCES|Premature close/,
  );
  await binPath.chmod(0o755);
  expect(await new PrintableShellCommand(binPath, []).text()).toEqual("hi\n");
});

test("spawnDetached", async () => {
  const tempPath = (await Path.makeTempDir()).join("file.txt");

  expect(await tempPath.exists()).toBe(false);
  new PrintableShellCommand("touch", [tempPath]).spawnDetached();

  // Wait a short while for the command to finish.
  await new Promise((resolve) => setTimeout(resolve, 100));
  expect(await tempPath.existsAsFile()).toBe(true);

  expect(() =>
    new PrintableShellCommand("touch", [tempPath]).spawnDetached({
      stdio: "pipe",
      // biome-ignore lint/suspicious/noExplicitAny: We're purposely passing an invalid value.
    } as any),
  ).toThrow("Unexpected `stdio` field.");
  expect(() =>
    new PrintableShellCommand("touch", [tempPath]).spawnDetached({
      detached: false,
      // biome-ignore lint/suspicious/noExplicitAny: We're purposely passing an invalid value.
    } as any),
  ).toThrow("Unexpected `detached` field.");
});

test(".stdin(…) (text)", async () => {
  const text = await new PrintableShellCommand("sed", [""])
    .stdin({ text: "hello world" })
    .text();
  expect(text).toEqual("hello world");
});

test(".stdin(…) (JSON)", async () => {
  const text = await new PrintableShellCommand("sed", [""])
    .stdin({ json: [6, 7] })
    .text();
  expect(text).toEqual("[6,7]");

  const json = await new PrintableShellCommand("sed", [""])
    .stdin({ json: [6, 7] })
    .json();
  expect(json).toEqual([6, 7]);
});

test(".stdin(…) (Path)", async () => {
  const path = (await Path.makeTempDir()).join("meme.json");
  await path.writeJSON([6, 7]);

  const json = await new PrintableShellCommand("sed", [""])
    .stdin({ path })
    .json();
  expect(json).toEqual([6, 7]);
});

test(".stdin(…) (web stream)", async () => {
  const tempDir = await Path.makeTempDir();
  await tempDir.join("a.txt").write("");
  await tempDir.join("b.txt").write("");

  const paths = await Array.fromAsync(
    new PrintableShellCommand("find", [
      tempDir,
      ["-type", "f"],
      "-print0",
    ]).text0(),
  );
  expect(paths.map((path) => new Path(path).basename.path).sort()).toEqual([
    "a.txt",
    "b.txt",
  ]);
});

test("`Path` commandName", async () => {
  const echoPath = new Path(
    // Note that we need to use `which` instead of `command` here, because the latter binary does not have the same functionality as `command --search` in the shell.
    (await new PrintableShellCommand("which", ["echo"]).stdout().text()).trim(),
  );
  await new PrintableShellCommand(echoPath, [
    "from a `Path` commandName!",
  ]).shellOut();
});

test("`Path` arg (unnested)", async () => {
  const tempDir = await Path.makeTempDir();

  await new PrintableShellCommand("ls", [tempDir]).shellOut();
});

test("`Path` arg (nested)", async () => {
  const tempDir = await Path.makeTempDir();

  await new PrintableShellCommand("ls", [[tempDir]]).shellOut();
});

test("`Path` cwd", async () => {
  const tempDir = await Path.makeTempDir();
  await tempDir.join("foo.txt").write("foo");
  await tempDir.join("bar.txt").write("bar");

  expect(
    await new PrintableShellCommand("ls", [tempDir]).stdout().text(),
  ).toEqual(`bar.txt
foo.txt
`);
});

test(".stdout(…)", async () => {
  expect(
    await new PrintableShellCommand("bash", ["-c", "echo hi 1>&2"])
      .stderr()
      .text(),
  ).toEqual("hi\n");
  expect(
    await new PrintableShellCommand("bash", ["-c", "echo hi 1>&2"])
      .stdout()
      .text(),
  ).toEqual("");
});

test(".stdout().text({ trimTrailingNewlines: … })", async () => {
  expect(() =>
    new PrintableShellCommand("echo", ["-n", "hi"]).stdout().text({
      trimTrailingNewlines: "single-required",
    }),
  ).toThrow("Trailing newline required, but not present.");
  expect(
    await new PrintableShellCommand("echo", ["hi"]).stdout().text({
      trimTrailingNewlines: "single-required",
    }),
  ).toEqual("hi");
  expect(
    await new PrintableShellCommand("echo", ["hi"]).stdout().text({
      trimTrailingNewlines: "single-if-present",
    }),
  ).toEqual("hi");
  expect(
    await new PrintableShellCommand("echo", ["hi"]).stdout().text({
      trimTrailingNewlines: "never",
    }),
  ).toEqual("hi\n");
});

test(".stdout.text({ trimTrailingNewlines: … })", async () => {
  expect(() =>
    new PrintableShellCommand("echo", ["-n", "hi"])
      .spawn({ stdio: ["ignore", "pipe", "ignore"] })
      .stdout.text({
        trimTrailingNewlines: "single-required",
      }),
  ).toThrow("Trailing newline required, but not present.");
  expect(
    await new PrintableShellCommand("echo", ["hi"])
      .spawn({ stdio: ["ignore", "pipe", "ignore"] })
      .stdout.text({
        trimTrailingNewlines: "single-required",
      }),
  ).toEqual("hi");
  expect(
    await new PrintableShellCommand("echo", ["hi"])
      .spawn({ stdio: ["ignore", "pipe", "ignore"] })
      .stdout.text({
        trimTrailingNewlines: "single-if-present",
      }),
  ).toEqual("hi");
  expect(
    await new PrintableShellCommand("echo", ["hi"])
      .spawn({ stdio: ["ignore", "pipe", "ignore"] })
      .stdout.text({
        trimTrailingNewlines: "never",
      }),
  ).toEqual("hi\n");
});

test(".stderr(…)", async () => {
  expect(
    await new PrintableShellCommand("bash", ["-c", "echo hi 1>&2"])
      .stdout()
      .text(),
  ).toEqual("");
  expect(
    await new PrintableShellCommand("bash", ["-c", "echo hi 1>&2"])
      .stderr()
      .text(),
  ).toEqual("hi\n");
});

test(".stderr().text({ trimTrailingNewlines: … })", async () => {
  expect(() =>
    new PrintableShellCommand("bash", ["-c", "echo -n hi 1>&2"]).stderr().text({
      trimTrailingNewlines: "single-required",
    }),
  ).toThrow("Trailing newline required, but not present.");
  expect(
    await new PrintableShellCommand("bash", ["-c", "echo hi 1>&2"])
      .stderr()
      .text({
        trimTrailingNewlines: "single-required",
      }),
  ).toEqual("hi");
  expect(
    await new PrintableShellCommand("bash", ["-c", "echo hi 1>&2"])
      .stderr()
      .text({
        trimTrailingNewlines: "single-if-present",
      }),
  ).toEqual("hi");
  expect(
    await new PrintableShellCommand("bash", ["-c", "echo hi 1>&2"])
      .stderr()
      .text({
        trimTrailingNewlines: "never",
      }),
  ).toEqual("hi\n");
});

test(".stderr.text({ trimTrailingNewlines: … })", async () => {
  expect(() =>
    new PrintableShellCommand("bash", ["-c", "echo -n hi 1>&2"])
      .spawn({ stdio: ["ignore", "ignore", "pipe"] })
      .stderr.text({
        trimTrailingNewlines: "single-required",
      }),
  ).toThrow("Trailing newline required, but not present.");
  expect(
    await new PrintableShellCommand("bash", ["-c", "echo hi 1>&2"])
      .spawn({ stdio: ["ignore", "ignore", "pipe"] })
      .stderr.text({
        trimTrailingNewlines: "single-required",
      }),
  ).toEqual("hi");
  expect(
    await new PrintableShellCommand("bash", ["-c", "echo hi 1>&2"])
      .spawn({ stdio: ["ignore", "ignore", "pipe"] })
      .stderr.text({
        trimTrailingNewlines: "single-if-present",
      }),
  ).toEqual("hi");
  expect(
    await new PrintableShellCommand("bash", ["-c", "echo hi 1>&2"])
      .spawn({ stdio: ["ignore", "ignore", "pipe"] })
      .stderr.text({
        trimTrailingNewlines: "never",
      }),
  ).toEqual("hi\n");
});

test(".stdout() and .stderr() — multiple success Promise awaiters", async () => {
  const { stdout, stderr } = new PrintableShellCommand("echo", ["hi"]).spawn({
    stdio: ["ignore", "pipe", "pipe"],
  });
  expect(await stdout.text()).toEqual("hi\n");
  expect(() => stdout.text()).toThrow("Body already used");
  expect(await stderr.text()).toEqual("");
  expect(() => stderr.text()).toThrow("Body already used");
});

test(".text()", async () => {
  expect(await new PrintableShellCommand("echo", ["-n", "hi"]).text()).toEqual(
    "hi",
  );
});

test(".text({ trimTrailingNewlines: … })", async () => {
  expect(() =>
    new PrintableShellCommand("echo", ["-n", "hi"]).text({
      trimTrailingNewlines: "single-required",
    }),
  ).toThrow("Trailing newline required, but not present.");
  expect(
    await new PrintableShellCommand("echo", ["hi"]).text({
      trimTrailingNewlines: "single-required",
    }),
  ).toEqual("hi");
  expect(
    await new PrintableShellCommand("echo", ["hi"]).text({
      trimTrailingNewlines: "single-if-present",
    }),
  ).toEqual("hi");
  expect(
    await new PrintableShellCommand("echo", ["hi"]).text({
      trimTrailingNewlines: "never",
    }),
  ).toEqual("hi\n");
});

test(".text()", async () => {
  const bogusBinaryPath = (await Path.makeTempDir()).join("bogus-bin");
  expect(() => new PrintableShellCommand(bogusBinaryPath).text()).toThrow(
    "Premature close",
  );
});

test(".json()", async () => {
  expect(
    await new PrintableShellCommand("echo", ["-n", '{ "foo": 4 }']).json<{
      foo: number;
    }>(),
  ).toEqual({ foo: 4 });
});

test(".text0(…)", async () => {
  const tempDir = await Path.makeTempDir();
  await tempDir.join("a.txt").write("");
  await tempDir.join("b.txt").write("");

  const paths = await Array.fromAsync(
    new PrintableShellCommand("find", [
      tempDir,
      ["-type", "f"],
      "-print0",
    ]).text0(),
  );
  expect(paths.map((path) => new Path(path).basename.path).sort()).toEqual([
    "a.txt",
    "b.txt",
  ]);
});

// TODO: `bun` non-deterministically hangs on this.
test.skip(".text0(…) missing trailing NUL", async () => {
  expect(() =>
    Array.fromAsync(new PrintableShellCommand("printf", ["a\\0b"]).text0()),
  ).toThrow(
    "Missing a trailing NUL character at the end of a NUL-delimited stream.",
  );
});

test(".text0(…) missing trailing NUL (workaround version)", async () => {
  let caught: Error | undefined;
  try {
    await Array.fromAsync(
      new PrintableShellCommand("printf", ["a\\0b"]).text0(),
    );
  } catch (e) {
    caught = e as Error;
  }
  assert(caught);
  expect(caught).toBeInstanceOf(Error);
  expect(caught.toString()).toEqual(
    "Error: Missing a trailing NUL character at the end of a NUL-delimited stream.",
  );
});

test(".json0(…)", async () => {
  const output = await Array.fromAsync(
    new PrintableShellCommand("printf", ["%s\\0%s\\0", "[]", '[""]']).json0(),
  );
  expect(output).toEqual([[], [""]]);
});

// TODO: `bun` non-deterministically hangs on this.
test.skip(".json0(…) missing trailing NUL", async () => {
  expect(() =>
    Array.fromAsync(
      new PrintableShellCommand("printf", ["%s\\0%s", "[]", '[""]']).json0(),
    ),
  ).toThrow(
    "Missing a trailing NUL character at the end of a NUL-delimited stream.",
  );
});

test(".json0(…) missing trailing NUL (workaround version)", async () => {
  let caught: Error | undefined;
  try {
    await Array.fromAsync(
      new PrintableShellCommand("printf", ["%s\\0%s", "[]", '[""]']).json0(),
    );
  } catch (e) {
    caught = e as Error;
  }
  expect(caught).toBeInstanceOf(Error);
  // Types are not powerful enough to infer this from last line.
  assert(caught);
  expect(caught.toString()).toEqual(
    "Error: Missing a trailing NUL character at the end of a NUL-delimited stream.",
  );
});

test(".shellOut()", async () => {
  await new PrintableShellCommand("echo", ["hi"]).shellOut();
  await new PrintableShellCommand("echo", ["hi"]).shellOut({
    print: { style: ["red", "bgYellow"] },
  });
});

const spyStdout = spyOn(stdout, "write");
const spyStderr = spyOn(stderr, "write");

function resetMocks() {
  spyStdout.mockReset();
  spyStderr.mockReset();
  globalThis.process.stdout.isTTY = false;
  globalThis.process.stderr.isTTY = false;
  // biome-ignore lint/complexity/useLiteralKeys: TODO: https://github.com/biomejs/biome/discussions/7404
  delete env["NO_COLOR"];
}

const PLAIN_ECHO: [string][] = [["echo \\\n  hi"], ["\n"]];
const PLAIN_ECHO_INLINE: [string][] = [["echo hi"], ["\n"]];
const BOLD_GRAY_ECHO: [string][] = [
  ["\u001b[90m\u001b[1mecho \\\n  hi\u001b[22m\u001b[39m"],
  ["\n"],
];

test.serial("tty (stderr)", async () => {
  resetMocks();

  new PrintableShellCommand("echo", ["hi"]).print();
  expect(spyStderr.mock.calls.slice(-2)).toEqual(PLAIN_ECHO);
  expect(spyStdout.mock.lastCall).toEqual(undefined);

  new PrintableShellCommand("echo", ["hi"]).print({
    autoStyle: "tty",
  });
  expect(spyStderr.mock.calls.slice(-2)).toEqual(PLAIN_ECHO);
  new PrintableShellCommand("echo", ["hi"]).print({
    autoStyle: "never",
  });
  expect(spyStderr.mock.calls.slice(-2)).toEqual(PLAIN_ECHO);

  globalThis.process.stderr.isTTY = true;
  new PrintableShellCommand("echo", ["hi"]).print();
  expect(spyStderr.mock.calls.slice(-2)).toEqual(BOLD_GRAY_ECHO);
  new PrintableShellCommand("echo", ["hi"]).print({
    autoStyle: "tty",
  });
  expect(spyStderr.mock.calls.slice(-2)).toEqual(BOLD_GRAY_ECHO);
  new PrintableShellCommand("echo", ["hi"]).print({
    autoStyle: "never",
  });
  expect(spyStderr.mock.calls.slice(-2)).toEqual(PLAIN_ECHO);
});

test.serial("NO_COLOR (stderr)", async () => {
  resetMocks();

  globalThis.process.stderr.isTTY = true;
  new PrintableShellCommand("echo", ["hi"]).print();
  expect(spyStderr.mock.calls.slice(-2)).toEqual(BOLD_GRAY_ECHO);

  // biome-ignore lint/complexity/useLiteralKeys: TODO: https://github.com/biomejs/biome/discussions/7404
  env["NO_COLOR"] = "true";

  new PrintableShellCommand("echo", ["hi"]).print();
  expect(spyStderr.mock.calls.slice(-2)).toEqual(PLAIN_ECHO);
  new PrintableShellCommand("echo", ["hi"]).print({ autoStyle: "never" });
  expect(spyStderr.mock.calls.slice(-2)).toEqual(PLAIN_ECHO);
  new PrintableShellCommand("echo", ["hi"]).print({ autoStyle: "tty" });
  expect(spyStderr.mock.calls.slice(-2)).toEqual(PLAIN_ECHO);
  new PrintableShellCommand("echo", ["hi"]).print({ style: ["gray", "bold"] });
  expect(spyStderr.mock.calls.slice(-2)).toEqual(PLAIN_ECHO);
});

test.serial("tty (stdout)", async () => {
  resetMocks();

  globalThis.process.stdout.isTTY = false;
  new PrintableShellCommand("echo", ["hi"]).print({ stream: stdout });
  expect(spyStderr.mock.lastCall).toEqual(undefined);
  expect(spyStdout.mock.calls.slice(-2)).toEqual(PLAIN_ECHO);

  globalThis.process.stdout.isTTY = false;
  new PrintableShellCommand("echo", ["hi"]).print({
    stream: stdout,
    autoStyle: "tty",
  });
  expect(spyStdout.mock.calls.slice(-2)).toEqual(PLAIN_ECHO);
  new PrintableShellCommand("echo", ["hi"]).print({
    stream: stdout,
    autoStyle: "never",
  });
  expect(spyStdout.mock.calls.slice(-2)).toEqual(PLAIN_ECHO);

  globalThis.process.stdout.isTTY = true;
  new PrintableShellCommand("echo", ["hi"]).print({ stream: stdout });
  expect(spyStdout.mock.calls.slice(-2)).toEqual(BOLD_GRAY_ECHO);
  new PrintableShellCommand("echo", ["hi"]).print({
    stream: stdout,
    autoStyle: "tty",
  });
  expect(spyStdout.mock.calls.slice(-2)).toEqual(BOLD_GRAY_ECHO);
  new PrintableShellCommand("echo", ["hi"]).print({
    stream: stdout,
    autoStyle: "never",
  });
  expect(spyStdout.mock.calls.slice(-2)).toEqual(PLAIN_ECHO);
});

test.serial("NO_COLOR (stdout)", async () => {
  resetMocks();

  globalThis.process.stdout.isTTY = true;
  new PrintableShellCommand("echo", ["hi"]).print({ stream: stdout });
  expect(spyStdout.mock.calls.slice(-2)).toEqual(BOLD_GRAY_ECHO);

  // biome-ignore lint/complexity/useLiteralKeys: TODO: https://github.com/biomejs/biome/discussions/7404
  env["NO_COLOR"] = "true";

  new PrintableShellCommand("echo", ["hi"]).print({ stream: stdout });
  expect(spyStdout.mock.calls.slice(-2)).toEqual(PLAIN_ECHO);
  new PrintableShellCommand("echo", ["hi"]).print({
    stream: stdout,
    autoStyle: "never",
  });
  expect(spyStdout.mock.calls.slice(-2)).toEqual(PLAIN_ECHO);
  new PrintableShellCommand("echo", ["hi"]).print({
    stream: stdout,
    autoStyle: "tty",
  });
  expect(spyStdout.mock.calls.slice(-2)).toEqual(PLAIN_ECHO);
  new PrintableShellCommand("echo", ["hi"]).print({
    stream: stdout,
    style: ["gray", "bold"],
  });
  expect(spyStdout.mock.calls.slice(-2)).toEqual(PLAIN_ECHO);
});

test.serial(".shellOut()", async () => {
  resetMocks();

  await new PrintableShellCommand("echo", ["hi"]).shellOut();
  expect(spyStdout.mock.lastCall).toEqual(undefined);
  expect(spyStderr.mock.calls.slice(-2)).toEqual(PLAIN_ECHO);
});

test.serial(".shellOut({ print: false })", async () => {
  resetMocks();

  await new PrintableShellCommand("echo", ["hi"]).shellOut({ print: false });
  expect(spyStdout.mock.lastCall).toEqual(undefined);
  expect(spyStderr.mock.lastCall).toEqual(undefined);
});

test.serial(".shellOut({ print: true })", async () => {
  resetMocks();

  await new PrintableShellCommand("echo", ["hi"]).shellOut({ print: true });
  expect(spyStdout.mock.lastCall).toEqual(undefined);
  expect(spyStderr.mock.calls.slice(-2)).toEqual(PLAIN_ECHO);
});

test.serial('.shellOut({: "inline" })', async () => {
  resetMocks();

  await new PrintableShellCommand("echo", ["hi"]).shellOut({ print: "inline" });
  expect(spyStdout.mock.lastCall).toEqual(undefined);
  expect(spyStderr.mock.calls.slice(-2)).toEqual(PLAIN_ECHO_INLINE);
});

// TODO: why do unrelated tests receive an unexpected newline on `stderr` if this test is not last?
test.serial("tty (fd 3)", async () => {
  resetMocks();

  const stream = createWriteStream("", { fd: 3 });

  new PrintableShellCommand("echo", ["hi"]).print({ stream });
  expect(spyStdout.mock.lastCall).toEqual(undefined);
  expect(spyStderr.mock.lastCall).toEqual(undefined);
});
