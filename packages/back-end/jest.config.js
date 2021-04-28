module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.entity.ts",
    "!src/**/*.mock.ts",
    "!src/**/*.seed.ts",
    "!src/**/index.ts",
    "!src/poke-api/**/*",
    "!src/db/migrations/*.ts",
    "!src/*.ts",
    "!src/environment/stage-mock-data.ts",
    "!src/draft/draft.middleware.ts", // ignoring until WebSockets are more figured out -- this code is not great anyways
    "!src/test/**/*.ts",
  ],
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.test.json",
    },
  },
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: -10,
    },
  },
};
