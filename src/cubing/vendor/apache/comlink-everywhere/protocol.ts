/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Any } from "./comlink";

export interface EventSource {
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    // biome-ignore lint/complexity/noBannedTypes: TODO
    options?: {},
  ): void;

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    // biome-ignore lint/complexity/noBannedTypes: TODO
    options?: {},
  ): void;
}

export interface PostMessageWithOrigin {
  postMessage(
    message: Any,
    targetOrigin: string,
    transfer?: Transferable[],
  ): void;
}

export interface Endpoint extends EventSource {
  postMessage(message: Any, transfer?: readonly Transferable[]): void;
  ref?: () => void;
  unref?: () => void;
  start?: () => void;
  terminate?: () => void;
  close?: () => void;
}

export enum WireValueType {
  RAW = "RAW",
  PROXY = "PROXY",
  THROW = "THROW",
  HANDLER = "HANDLER",
}

export interface RawWireValue {
  id?: string;
  type: WireValueType.RAW;
  // biome-ignore lint/complexity/noBannedTypes: TODO
  value: {};
}

export interface HandlerWireValue {
  id?: string;
  type: WireValueType.HANDLER;
  name: string;
  value: unknown;
}

export type WireValue = RawWireValue | HandlerWireValue;

export type MessageID = string;

export enum MessageType {
  GET = "GET",
  SET = "SET",
  APPLY = "APPLY",
  CONSTRUCT = "CONSTRUCT",
  ENDPOINT = "ENDPOINT",
  RELEASE = "RELEASE",
}

export interface GetMessage {
  id?: MessageID;
  type: MessageType.GET;
  path: string[];
}

export interface SetMessage {
  id?: MessageID;
  type: MessageType.SET;
  path: string[];
  value: WireValue;
}

export interface ApplyMessage {
  id?: MessageID;
  type: MessageType.APPLY;
  path: string[];
  argumentList: WireValue[];
}

export interface ConstructMessage {
  id?: MessageID;
  type: MessageType.CONSTRUCT;
  path: string[];
  argumentList: WireValue[];
}

export interface EndpointMessage {
  id?: MessageID;
  type: MessageType.ENDPOINT;
}

export interface ReleaseMessage {
  id?: MessageID;
  type: MessageType.RELEASE;
}

export type Message =
  | GetMessage
  | SetMessage
  | ApplyMessage
  | ConstructMessage
  | EndpointMessage
  | ReleaseMessage;
