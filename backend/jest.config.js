/** @type {import("jest").Config} */
const config = {
  globalSetup: "./tests/setup.ts",
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          module: "commonjs",
          moduleResolution: "node",
          esModuleInterop: true,
          types: ["jest", "node"],
          isolatedModules: true,
          ignoreDeprecations: "6.0",
        },
      },
    ],
  },
  // Strips .js extension from relative imports so ts-jest resolves .ts files
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};

module.exports = config;
