let DEBUG_LOGGING_ENABLED = false ;

export function enableDebugLogging(enable: boolean): void {
  DEBUG_LOGGING_ENABLED = enable;
}

export function debugLog(...args: any[]): void {
  if (!DEBUG_LOGGING_ENABLED) {
    return;
  }

  if (console.info) {
    console.info.apply(console, args);
  } else {
    console.log.apply(console, args);
  }
}
