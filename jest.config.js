module.exports = {
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.js$": "babel-jest",
    "^.+\\.ts$": "ts-jest",
    "^.+\\.pegjs$": "pegjs-jest",
    "\\.svg$": "jest-raw-loader",
  },
  // By default, Jest doesn't transpile deps. But we're importing some module
  // deps, so we define the ignore pattern to un-ignore those.
  transformIgnorePatterns: ["node_modules/(?!(three/examples/jsm)/)"],
};
