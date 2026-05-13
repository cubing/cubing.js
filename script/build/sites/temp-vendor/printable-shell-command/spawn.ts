import type {
  ChildProcess,
  ChildProcessByStdio,
  ChildProcessWithoutNullStreams,
  ProcessEnvOptions,
  SpawnOptions,
  SpawnOptionsWithoutStdio,
  SpawnOptionsWithStdioTuple,
  StdioNull,
  StdioPipe,
} from "node:child_process";
import type { Readable, Writable } from "node:stream";
import type { Path } from "path-class";
import type { TrailingNewlineOptions } from "./trimTrailingNewlines";

export type NodeCwd = ProcessEnvOptions["cwd"] | Path;
export type NodeWithCwd<T extends { cwd?: ProcessEnvOptions["cwd"] }> = Omit<
  T,
  "cwd"
> & { cwd?: NodeCwd };

export interface WithExitPromises {
  success: Promise<void>;
  exited: Promise<void>;
  // This can't be called `exitCode`, because that's already taken by the lazily populated property.
  exitCodePromise: Promise<number>;
}

export interface WithResponse {
  response: () => Response;
  text: (options?: TrailingNewlineOptions) => Promise<string>;
  text0: () => AsyncGenerator<string>;
  json: <T>() => Promise<T>;
}
export interface WithStdoutResponse {
  stdout: Readable & WithResponse;
}

export interface WithStderrResponse {
  stderr: Readable & WithResponse;
}

export declare function spawnType(
  options?: NodeWithCwd<SpawnOptionsWithoutStdio>,
): ChildProcessWithoutNullStreams & WithExitPromises;
export declare function spawnType(
  options: NodeWithCwd<
    SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioPipe>
  >,
): ChildProcessByStdio<Writable, Readable, Readable> &
  WithExitPromises &
  WithStdoutResponse &
  WithStderrResponse;
export declare function spawnType(
  options: NodeWithCwd<
    SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioNull>
  >,
): ChildProcessByStdio<Writable, Readable, null> &
  WithExitPromises &
  WithStdoutResponse;
export declare function spawnType(
  options: NodeWithCwd<
    SpawnOptionsWithStdioTuple<StdioPipe, StdioNull, StdioPipe>
  >,
): ChildProcessByStdio<Writable, null, Readable> &
  WithExitPromises &
  WithStderrResponse;
export declare function spawnType(
  options: NodeWithCwd<
    SpawnOptionsWithStdioTuple<StdioNull, StdioPipe, StdioPipe>
  >,
): ChildProcessByStdio<null, Readable, Readable> &
  WithExitPromises &
  WithStdoutResponse &
  WithStderrResponse;
export declare function spawnType(
  options: NodeWithCwd<
    SpawnOptionsWithStdioTuple<StdioPipe, StdioNull, StdioNull>
  >,
): ChildProcessByStdio<Writable, null, null> & WithExitPromises;
export declare function spawnType(
  options: NodeWithCwd<
    SpawnOptionsWithStdioTuple<StdioNull, StdioPipe, StdioNull>
  >,
): ChildProcessByStdio<null, Readable, null> &
  WithExitPromises &
  WithStdoutResponse;
export declare function spawnType(
  options: NodeWithCwd<
    SpawnOptionsWithStdioTuple<StdioNull, StdioNull, StdioPipe>
  >,
): ChildProcessByStdio<null, null, Readable> &
  WithExitPromises &
  WithStderrResponse;
export declare function spawnType(
  options: NodeWithCwd<
    SpawnOptionsWithStdioTuple<StdioNull, StdioNull, StdioNull>
  >,
): ChildProcessByStdio<null, null, null> & WithExitPromises;
export declare function spawnType(
  options: NodeWithCwd<SpawnOptions>,
): ChildProcess & WithExitPromises;
