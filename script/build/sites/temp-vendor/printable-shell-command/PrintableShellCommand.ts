import assert from "node:assert";
import type {
  ChildProcessByStdio,
  ChildProcess as NodeChildProcess,
  SpawnOptions as NodeSpawnOptions,
} from "node:child_process";
import { createReadStream } from "node:fs";
import { stderr } from "node:process";
import { Readable, Writable } from "node:stream";
import type { WriteStream } from "node:tty";
import { styleText } from "node:util";
import { Path, stringifyIfPath } from "path-class";
import type {
  NodeWithCwd,
  spawnType,
  WithExitPromises,
  WithStderrResponse,
  WithStdoutResponse,
} from "./spawn";
import {
  handleTrailingNewlines,
  type TrailingNewlineOptions,
  wrapHandleTrailingNewlinesForResponder,
  wrapHandleTrailingNewlinesForResponse,
} from "./trimTrailingNewlines";

const DEFAULT_MAIN_INDENTATION = "";
const DEFAULT_ARG_INDENTATION = "  ";
const DEFAULT_ARGUMENT_LINE_WRAPPING = "by-entry";

const INLINE_SEPARATOR = " ";
const LINE_WRAP_LINE_END = " \\\n";

type StyleTextFormat = Parameters<typeof styleText>[0];

const TTY_AUTO_STYLE: StyleTextFormat = ["gray", "bold"];

// biome-ignore lint/suspicious/noExplicitAny: This is the correct type nere.
function isString(s: any): s is string {
  return typeof s === "string";
}

// biome-ignore lint/suspicious/noExplicitAny: This is the correct type here.
function isValidArgsEntryArray(entries: any[]): entries is SingleArgument[] {
  for (const entry of entries) {
    if (isString(entry)) {
      continue;
    }
    if (entry instanceof Path) {
      continue;
    }
    return false;
  }
  return true;
}

// TODO: allow `.toString()`ables?
type SingleArgument = string | Path;
type ArgsEntry = SingleArgument | SingleArgument[];
type Args = ArgsEntry[];

const ARGUMENT_LINE_WRAPPING_VALUES = [
  "by-entry",
  "nested-by-entry",
  "by-argument",
  "inline",
] as const;
type ArgumentLineWrapping = (typeof ARGUMENT_LINE_WRAPPING_VALUES)[number];

export interface PrintOptions {
  /** Defaults to "" */
  mainIndentation?: string;
  /** Defaults to "  " */
  argIndentation?: string;
  /**
   * - `"auto"`: Quote only arguments that need it for safety. This tries to be
   *   portable and safe across shells, but true safety and portability is hard
   *   to guarantee.
   * - `"extra-safe"`: Quote all arguments, even ones that don't need it. This is
   *   more likely to be safe under all circumstances.
   */
  quoting?: "auto" | "extra-safe";
  /** Line wrapping to use between arguments. Defaults to `"by-entry"`. */
  argumentLineWrapping?: ArgumentLineWrapping;
  /** Include the first arg (or first arg group) on the same line as the command, regardless of the `argumentLineWrapping` setting. */
  skipLineWrapBeforeFirstArg?: true | false;
  /**
   * Style text using `node`'s {@link styleText | `styleText(…)`}.
   *
   * Example usage:
   *
   * ```
   * new PrintableShellCommand("echo", ["hi"]).print({
   *   style: ["green", "underline"],
   * });
   * */
  style?: StyleTextFormat;
}

/**
 * https://no-color.org/
 *
 * > Command-line software which adds ANSI color to its output by default should
 * > check for a NO_COLOR environment variable that, when present and not an
 * > empty string (regardless of its value), prevents the addition of ANSI
 * > color.
 *
 * I think it's a bit silly that `NO_COLOR=false` and `NO_COLOR=0` count as "no
 * color please", but 🤷
 *
 */
function NO_COLOR(): boolean {
  const { env } = globalThis.process.getBuiltinModule("node:process");
  // The empty string is falsy, so we can just use `!!`.
  // biome-ignore lint/complexity/useLiteralKeys: TODO: https://github.com/biomejs/biome/discussions/7572
  return !!env["NO_COLOR"];
}

export interface StreamPrintOptions extends PrintOptions {
  /**
   * Auto-style the text when:
   *
   * - the output stream is detected to be a TTY
   * - `styleTextFormat` is not specified.
   *
   * The current auto style is: `["gray", "bold"]`
   */
  autoStyle?: "tty" | "never";
  // This would be a `WritableStream` (open web standard), but `WriteStream` allows us to query `.isTTY`.
  stream?: WriteStream | Writable;
}

// https://mywiki.wooledge.org/BashGuide/SpecialCharacters
const SPECIAL_SHELL_CHARACTERS = new Set([
  " ",
  '"',
  "'",
  "`",
  "|",
  "$",
  "*",
  "?",
  ">",
  "<",
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
  "&",
  "\\",
  ";",
  "#",
]);

// https://mywiki.wooledge.org/BashGuide/SpecialCharacters
const SPECIAL_SHELL_CHARACTERS_FOR_MAIN_COMMAND =
  // biome-ignore lint/suspicious/noExplicitAny: Workaround to make this package easier to use in a project that otherwise only uses ES2022.)
  (SPECIAL_SHELL_CHARACTERS as unknown as any).union(new Set(["="]));

// TODO: Is there an idiomatic ways to check that all potential fields of
// `StdinSource` satisfy `(typeof STDIN_SOURCE_KEYS)[number]`, without adding
// extra indirection for type wrangling?
const STDIN_SOURCE_KEYS = ["text", "json", "path", "stream"] as const;
export type StdinSource =
  | { text: string }
  // biome-ignore lint/suspicious/noExplicitAny: `any` is the correct type for JSON data.
  | { json: any }
  | { path: string | Path }
  | { stream: Readable | ReadableStream };

interface AllowFailureOptions {
  allowFailure?: boolean;
}

export class PrintableShellCommand {
  #commandName: string | Path;
  constructor(
    commandName: string | Path,
    private args: Args = [],
  ) {
    if (!isString(commandName) && !(commandName instanceof Path)) {
      // biome-ignore lint/suspicious/noExplicitAny: We want to print this, no matter what it is.
      throw new Error("Command name is not a string:", commandName as any);
    }
    this.#commandName = commandName;
    if (typeof args === "undefined") {
      return;
    }
    if (!Array.isArray(args)) {
      throw new Error("Command arguments are not an array");
    }
    for (let i = 0; i < args.length; i++) {
      const argEntry = args[i];
      if (typeof argEntry === "string") {
        continue;
      }
      if (argEntry instanceof Path) {
        continue;
      }
      if (Array.isArray(argEntry) && isValidArgsEntryArray(argEntry)) {
        continue;
      }
      throw new Error(`Invalid arg entry at index: ${i}`);
    }
  }

  get commandName(): string {
    return stringifyIfPath(this.#commandName);
  }

  /**
   * For use with `node:child_process`
   *
   * Usage example:
   *
   * ```
   * import { PrintableShellCommand } from "printable-shell-command";
   * import { spawn } from "node:child_process";
   *
   * const command = new PrintableShellCommand( … );
   * const child_process = spawn(...command.toCommandWithFlatArgs()); // Note the `...`
   * ```
   *
   */
  public toCommandWithFlatArgs(): [string, string[]] {
    return [this.commandName, this.args.flat().map(stringifyIfPath)];
  }

  #mainIndentation(options: PrintOptions): string {
    return options?.mainIndentation ?? DEFAULT_MAIN_INDENTATION;
  }

  #argIndentation(options: PrintOptions): string {
    return (
      this.#mainIndentation(options) +
      (options?.argIndentation ?? DEFAULT_ARG_INDENTATION)
    );
  }

  #lineWrapSeparator(options: PrintOptions): string {
    return LINE_WRAP_LINE_END + this.#argIndentation(options);
  }

  #argPairSeparator(options: PrintOptions): string {
    switch (options?.argumentLineWrapping ?? DEFAULT_ARGUMENT_LINE_WRAPPING) {
      case "by-entry": {
        return INLINE_SEPARATOR;
      }
      case "nested-by-entry": {
        return this.#lineWrapSeparator(options) + this.#argIndentation(options);
      }
      case "by-argument": {
        return this.#lineWrapSeparator(options);
      }
      case "inline": {
        return INLINE_SEPARATOR;
      }
      default:
        throw new Error("Invalid argument line wrapping argument.");
    }
  }

  #intraEntrySeparator(options: PrintOptions): string {
    switch (options?.argumentLineWrapping ?? DEFAULT_ARGUMENT_LINE_WRAPPING) {
      case "by-entry":
      case "nested-by-entry":
      case "by-argument": {
        return LINE_WRAP_LINE_END + this.#argIndentation(options);
      }
      case "inline": {
        return INLINE_SEPARATOR;
      }
      default:
        throw new Error("Invalid argument line wrapping argument.");
    }
  }

  #separatorAfterCommand(
    options: PrintOptions,
    numFollowingEntries: number,
  ): string {
    if (numFollowingEntries === 0) {
      return "";
    }
    if (options.skipLineWrapBeforeFirstArg ?? false) {
      return INLINE_SEPARATOR;
    }
    return this.#intraEntrySeparator(options);
  }

  public getPrintableCommand(options?: PrintOptions): string {
    // TODO: Why in the world does TypeScript not give the `options` arg the type of `PrintOptions | undefined`???
    options ??= {};
    const serializedEntries: string[] = [];

    for (let i = 0; i < this.args.length; i++) {
      const argsEntry = stringifyIfPath(this.args[i]);

      if (isString(argsEntry)) {
        serializedEntries.push(escapeArg(argsEntry, false, options));
      } else {
        serializedEntries.push(
          argsEntry
            .map((part) => escapeArg(stringifyIfPath(part), false, options))
            .join(this.#argPairSeparator(options)),
        );
      }
    }

    let text =
      this.#mainIndentation(options) +
      escapeArg(this.commandName, true, options) +
      this.#separatorAfterCommand(options, serializedEntries.length) +
      serializedEntries.join(this.#intraEntrySeparator(options));
    if (options?.style) {
      text = styleText(options.style, text);
    }
    return text;
  }

  /**
   * Print the shell command to {@link stderr} (default) or a specified stream.
   *
   * By default, this will be auto-styled (as bold gray) when `.isTTY` is true
   * for the stream. `.isTTY` is populated for the {@link stderr} and
   * {@link stdout} objects. Pass `"autoStyle": "never"` or an explicit
   * `style` to disable this.
   *
   */
  public print(options?: StreamPrintOptions): PrintableShellCommand {
    const stream = options?.stream ?? stderr;
    // Note: we only need to modify top-level fields, so `structuredClone(…)`
    // would be overkill and can only cause performance issues.
    const optionsCopy = {
      ...options,
      style: this.#styleFromOptions(stream, options),
    };
    const writable =
      stream instanceof Writable ? stream : Writable.fromWeb(stream);
    writable.write(this.getPrintableCommand(optionsCopy));
    writable.write("\n");
    return this;
  }

  #styleFromOptions(
    stream: WriteStream | Writable,
    options?: StreamPrintOptions,
  ): StyleTextFormat | undefined {
    if (options?.autoStyle === "never") {
      return;
    }
    if (!(stream as { isTTY?: boolean }).isTTY) {
      return;
    }
    if (NO_COLOR()) {
      return;
    }
    return TTY_AUTO_STYLE;
  }

  #stdinSource: StdinSource | undefined;
  /**
   * Send data to `stdin` of the subprocess.
   *
   * Note that this will overwrite:
   *
   * - Any previous value set using {@link PrintableShellCommand.stdin | `.stdin(…)`}.
   * - Any value set for `stdin` using the `"stdio"` field of {@link PrintableShellCommand.spawn | `.spawn(…)`}.
   */
  stdin(source: StdinSource): PrintableShellCommand {
    const [key, ...moreKeys] = Object.keys(source);
    assert.equal(moreKeys.length, 0);
    // TODO: validate values?
    assert((STDIN_SOURCE_KEYS as unknown as string[]).includes(key));

    this.#stdinSource = source;
    return this;
  }

  /**
   * The returned child process includes a `.success` `Promise` field, per https://github.com/oven-sh/bun/issues/8313
   */
  public spawn: typeof spawnType = ((
    options?: Parameters<typeof spawnType>[0],
  ) => {
    const { spawn } = process.getBuiltinModule("node:child_process");
    const cwd = stringifyIfPath(options?.cwd);
    options = { ...options };
    if (this.#stdinSource) {
      options ??= {};
      if (typeof options.stdio === "undefined") {
        options.stdio = "pipe";
      }
      if (typeof options.stdio === "string") {
        options.stdio = new Array(3).fill(options.stdio);
      }
      options.stdio = ["pipe", ...options.stdio.slice(1)];
    }
    // biome-ignore lint/suspicious/noTsIgnore: We don't want linting to depend on *broken* type checking.
    // @ts-ignore: The TypeScript checker has trouble reconciling the optional (i.e. potentially `undefined`) `options` with the third argument.
    const subprocess = spawn(...this.toCommandWithFlatArgs(), {
      ...(options as object),
      cwd,
    }) as NodeChildProcess & {
      success: Promise<void>;
    };
    let cachedExitCode: Promise<number> | undefined;
    const getCachedExitCode = (): Promise<number> => {
      // biome-ignore lint/suspicious/noAssignInExpressions: Caching pattern.
      return (cachedExitCode ??=
        // TODO: Use `Promise.withResolvers()` ocne we default to ES2024.
        new Promise((resolve, reject) => {
          if (subprocess.exitCode !== null) {
            resolve(subprocess.exitCode);
          }
          subprocess.addListener(
            "exit",
            /* we only use the first arg */
            resolve,
          );
          // biome-ignore lint/suspicious/noExplicitAny: We don't have the type available.
          subprocess.addListener("error", (err: any) => {
            reject(err);
          });
        }));
    };

    // TODO: define properties on prototypes instead.
    Object.defineProperty(subprocess, "success", {
      get() {
        return (async () => {
          const exitCode = await getCachedExitCode();
          if (exitCode !== 0) {
            throw new Error(
              `Command failed with non-zero exit code: ${exitCode}`,
            );
          }
        })();
      },
      enumerable: false,
    });
    Object.defineProperty(subprocess, "exited", {
      get() {
        return (async () => {
          await getCachedExitCode();
        })();
      },
      enumerable: false,
    });
    Object.defineProperty(subprocess, "exitCodePromise", {
      get() {
        return getCachedExitCode();
      },
      enumerable: false,
    });

    if (subprocess.stdout) {
      // TODO: dedupe
      const s = subprocess as unknown as Readable &
        WithStdoutResponse &
        WithExitPromises;
      let cachedResponse: Response | undefined;
      s.stdout.response = () =>
        (cachedResponse ??= wrapHandleTrailingNewlinesForResponse(
          new Response(Readable.from(this.#generator(s.stdout, s))),
        ));
      s.stdout.text = wrapHandleTrailingNewlinesForResponder(s.stdout);
      const thisCached = this; // TODO: make this type-check using `.bind(…)`
      s.stdout.text0 = async function* () {
        yield* thisCached.#split0(thisCached.#generator(s.stdout, s));
      };
      s.stdout.json = <T>() => s.stdout.response().json() as Promise<T>;
    }
    if (subprocess.stderr) {
      // TODO: dedupe
      const s = subprocess as unknown as Readable &
        WithStderrResponse &
        WithExitPromises;
      let cachedResponse: Response | undefined;
      s.stderr.response = () =>
        (cachedResponse ??= wrapHandleTrailingNewlinesForResponse(
          new Response(Readable.from(this.#generator(s.stderr, s))),
        ));
      s.stderr.text = wrapHandleTrailingNewlinesForResponder(s.stderr);
      const thisCached = this; // TODO: make this type-check using `.bind(…)`
      s.stderr.text0 = async function* () {
        yield* thisCached.#split0(thisCached.#generator(s.stderr, s));
      };
      s.stderr.json = <T>() => s.stderr.response().json() as Promise<T>;
    }
    if (this.#stdinSource) {
      const { stdin } = subprocess;
      assert(stdin);
      if ("text" in this.#stdinSource) {
        stdin.write(this.#stdinSource.text);
        stdin.end();
      } else if ("json" in this.#stdinSource) {
        stdin.write(JSON.stringify(this.#stdinSource.json));
        stdin.end();
      } else if ("path" in this.#stdinSource) {
        createReadStream(stringifyIfPath(this.#stdinSource.path)).pipe(stdin);
      } else if ("stream" in this.#stdinSource) {
        const stream = (() => {
          const { stream } = this.#stdinSource;
          return stream instanceof Readable ? stream : Readable.fromWeb(stream);
        })();
        stream.pipe(stdin);
      } else {
        throw new Error("Invalid `.stdin(…)` source?");
      }
    }
    return subprocess;
    // biome-ignore lint/suspicious/noExplicitAny: Type wrangling
  }) as any;

  /** A wrapper for `.spawn(…)` that sets stdio to `"inherit"` (common for
   * invoking commands from scripts whose output and interaction should be
   * surfaced to the user).
   *
   * If there is no other interaction with the shell from the calling process,
   * then it acts "transparent" and allows user to interact with the subprocess
   * in its stead.
   */
  public spawnPassthrough(
    options?: NodeWithCwd<Omit<NodeSpawnOptions, "stdio">>,
  ): ChildProcessByStdio<null, null, null> & WithExitPromises {
    if (options && "stdio" in options) {
      throw new Error("Unexpected `stdio` field.");
    }

    // biome-ignore lint/suspicious/noExplicitAny: Type wrangling.
    return this.spawn({ ...options, stdio: "inherit" }) as any;
  }

  /** @deprecated Use `.spawnPassthrough(…)` instead. */
  spawnTransparently = (
    ...args: Parameters<PrintableShellCommand["spawnPassthrough"]>
  ): ReturnType<PrintableShellCommand["spawnPassthrough"]> =>
    this.spawnPassthrough(...args);

  /**
   * A wrapper for {@link PrintableShellCommand.spawn | `.spawn(…)`} that:
   *
   * - sets `detached` to `true`,
   * - sets stdio to `"inherit"`,
   * - calls `.unref()`, and
   * - does not wait for the process to exit.
   *
   * This is similar to starting a command in the background and disowning it (in a shell).
   *
   */
  public spawnDetached(
    options?: NodeWithCwd<Omit<Omit<NodeSpawnOptions, "stdio">, "detached">>,
  ): void {
    if (options) {
      for (const field of ["stdio", "detached"]) {
        if (field in options) {
          throw new Error(`Unexpected \`${field}\` field.`);
        }
      }
    }
    const childProcess = this.spawn({
      stdio: "ignore",
      ...options,
      detached: true,
    });
    childProcess.unref();
  }

  #generator(
    readable: Readable,
    exiter: WithExitPromises,
    options?: AllowFailureOptions,
  ): AsyncGenerator<string> {
    // TODO: we'd make this a `ReadableStream`, but `ReadableStream.from(…)` is
    // not implemented in `bun`: https://github.com/oven-sh/bun/issues/3700
    return (async function* () {
      for await (const chunk of readable) {
        yield chunk;
      }
      if (options?.allowFailure) {
        await exiter.exited;
      } else {
        await exiter.success;
      }
    })();
  }

  #stdoutSpawnGenerator(
    options?: NodeWithCwd<Omit<NodeSpawnOptions, "stdio">> &
      AllowFailureOptions,
  ): AsyncGenerator<string> {
    if (options && "stdio" in options) {
      throw new Error("Unexpected `stdio` field.");
    }
    const subprocess = this.spawn({
      ...options,
      stdio: ["ignore", "pipe", "inherit"],
    });
    return this.#generator(subprocess.stdout, subprocess, options);
  }

  public stdout(
    options?: NodeWithCwd<Omit<NodeSpawnOptions, "stdio">> &
      AllowFailureOptions,
  ): Response & {
    text: (options?: TrailingNewlineOptions) => Promise<string>;
  } {
    // TODO: Use `ReadableStream.from(…)` once `bun` implements it: https://github.com/oven-sh/bun/pull/21269
    return wrapHandleTrailingNewlinesForResponse(
      new Response(Readable.from(this.#stdoutSpawnGenerator(options))),
    );
  }

  #stderrSpawnGenerator(
    options?: NodeWithCwd<Omit<NodeSpawnOptions, "stdio">> &
      AllowFailureOptions,
  ): AsyncGenerator<string> {
    if (options && "stdio" in options) {
      throw new Error("Unexpected `stdio` field.");
    }
    const subprocess = this.spawn({
      ...options,
      stdio: ["ignore", "inherit", "pipe"],
    });
    return this.#generator(subprocess.stderr, subprocess, options);
  }

  public stderr(
    options?: NodeWithCwd<Omit<NodeSpawnOptions, "stdio">> &
      AllowFailureOptions,
  ): Response & {
    text: (options?: TrailingNewlineOptions) => Promise<string>;
  } {
    // TODO: Use `ReadableStream.from(…)` once `bun` implements it: https://github.com/oven-sh/bun/pull/21269
    return wrapHandleTrailingNewlinesForResponse(
      new Response(Readable.from(this.#stderrSpawnGenerator(options))),
    );
  }

  async *#split0(generator: AsyncGenerator<string>): AsyncGenerator<string> {
    let pending = "";
    for await (const chunk of generator) {
      pending += chunk;
      const newChunks = pending.split("\x00");
      pending = newChunks.splice(-1)[0];
      yield* newChunks;
    }
    if (pending !== "") {
      throw new Error(
        "Missing a trailing NUL character at the end of a NUL-delimited stream.",
      );
    }
  }

  /**
   * Convenience function for:
   *
   *     .stdout(options).text()
   *
   * This can make some simple invocations easier to read and/or fit on a single line.
   */
  public async text(
    options?: NodeWithCwd<Omit<NodeSpawnOptions, "stdio">> &
      TrailingNewlineOptions &
      AllowFailureOptions,
  ): Promise<string> {
    const {
      trimTrailingNewlines: trimTrailingNewlinesOption,
      ...stdoutOptions
    } = options ?? {};
    return handleTrailingNewlines(this.stdout(stdoutOptions).text(), {
      trimTrailingNewlines: trimTrailingNewlinesOption,
    });
  }

  /**
   * Convenience function for:
   *
   *     .stdout(options).json()
   *
   * This can make some simple invocations easier to read and/or fit on a single line.
   */
  public json<T>(
    options?: NodeWithCwd<Omit<NodeSpawnOptions, "stdio">> &
      AllowFailureOptions,
  ): Promise<T> {
    return this.stdout(options).json() as Promise<T>;
  }

  /**
   * Parse `stdout` into a generator of string values using a NULL delimiter.
   *
   * A trailing NULL delimiter from `stdout` is required and removed.
   */
  public async *text0(
    options?: NodeWithCwd<Omit<NodeSpawnOptions, "stdio">> &
      AllowFailureOptions,
  ): AsyncGenerator<string> {
    yield* this.#split0(this.#stdoutSpawnGenerator(options));
  }

  /**
   * Parse `stdout` into a generator of JSON values using a NULL delimiter.
   *
   * A trailing NULL delimiter from `stdout` is required and removed.
   */
  public async *json0(
    options?: NodeWithCwd<Omit<NodeSpawnOptions, "stdio">> &
      AllowFailureOptions,
  ): // biome-ignore lint/suspicious/noExplicitAny: `any` is the correct type for JSON
  AsyncGenerator<any> {
    for await (const part of this.#split0(
      this.#stdoutSpawnGenerator(options),
    )) {
      yield JSON.parse(part);
    }
  }

  /** Equivalent to:
   *
   * ```
   * await this.print(…).spawnTransparently(…).success;
   * ```
   */
  public async shellOut(
    options?: NodeWithCwd<Omit<NodeSpawnOptions, "stdio">> & {
      print?: StreamPrintOptions | ArgumentLineWrapping | boolean;
    },
  ): Promise<void> {
    const { print: printOptions, ...spawnOptions } = options ?? {};

    if (typeof printOptions === "string") {
      assert(ARGUMENT_LINE_WRAPPING_VALUES.includes(printOptions));
      this.print({ argumentLineWrapping: printOptions });
    } else if (printOptions === true) {
      this.print();
    } else if (printOptions === false) {
      // no-op
    } else {
      this.print(printOptions);
    }
    await this.spawnPassthrough(spawnOptions).success;
  }
}

export function escapeArg(
  arg: string,
  isMainCommand: boolean,
  options: PrintOptions,
): string {
  const argCharacters = new Set(arg);
  const specialShellCharacters = isMainCommand
    ? SPECIAL_SHELL_CHARACTERS_FOR_MAIN_COMMAND
    : SPECIAL_SHELL_CHARACTERS;
  if (
    options?.quoting === "extra-safe" ||
    // biome-ignore lint/suspicious/noExplicitAny: Workaround to make this package easier to use in a project that otherwise only uses ES2022.)
    (argCharacters as unknown as any).intersection(specialShellCharacters)
      .size > 0
  ) {
    // Use single quote to reduce the need to escape (and therefore reduce the chance for bugs/security issues).
    const escaped = arg.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
    return `'${escaped}'`;
  }
  return arg;
}
