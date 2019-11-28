import {
	WebGLRenderer
} from 'three';

export interface WEBVROptions {
	referenceSpaceType: string;
}

export namespace WEBVR {
	export function createButton(renderer: WebGLRenderer, options?: WEBVROptions): HTMLElement;
}
