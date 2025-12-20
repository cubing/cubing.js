// NOTE: this file must be usable after `make reset`, so it cannot import any
// packages. (Built-in modules and intra-repo imports are fine, as long as they
// don't transitively import any packages.)

// NOTE: This only cleans what is needed for `make reset` *on top of* `make clean`.

import { rm } from "node:fs/promises";

const GET_IT_DONE = { recursive: true, force: true, maxRetries: 5 };

await Promise.all([rm("./node_modules", GET_IT_DONE)]);
