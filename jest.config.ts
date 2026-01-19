import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",

  // ts-jest configuration
  globals: {
    "ts-jest": {
      tsconfig: {
        jsx: "react-jsx",
      },
    },
  },

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // Module path aliases (matches tsconfig.json paths)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^@db/(.*)$": "<rootDir>/src/db/$1",
    // Mock CSS imports
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },

  // Test match patterns
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],

  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/**/__tests__/**",
    "!src/types/**",
  ],

  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },

  // Coverage reporters
  coverageReporters: ["text", "lcov", "html"],

  // Transform ignore patterns
  transformIgnorePatterns: ["node_modules/(?!(heic2any)/)"],
};

export default config;
