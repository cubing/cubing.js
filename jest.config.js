export default {
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.js$": "babel-jest",
    "^.+\\.ts$": "ts-jest",
    "^.+\\.pegjs$": "pegjs-jest",
    "\\.svg$": "jest-raw-loader",
  },
  // By default, Jest doesn't transpile deps. But we're importing some module
  // deps, so we define the ignore pattern to un-ignore those.
  //
  // TODO: This used to be `node_modules/(?!(three/examples/jsm)/)` to avoid
  // transpiling all of `three` (Which is quite large), but that doesn't seem to work properly.
  transformIgnorePatterns: ["node_modules/(?!(three/))"],
};
