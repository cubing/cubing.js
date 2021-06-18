import type { Worker as NodeWorker } from "worker_threads";
import type { insideAPI } from "../../api/inside";

export type { NodeWorker };
export type URLReference = URL | string;

export type ModuleSystem = "cjs" | "esm";
export type RuntimeEnvironment = "node" | "browser";

export type WorkerInsideAPI = typeof insideAPI;
