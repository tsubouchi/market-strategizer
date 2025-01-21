import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@db$': '<rootDir>/db/index.ts',
    '^@db/(.*)$': '<rootDir>/db/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: "react-jsx",
        module: "esnext",
        target: "ES2022",
        esModuleInterop: true,
        moduleResolution: "node",
        noImplicitAny: false,
        skipLibCheck: true
      },
      useESM: true
    }]
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@?react.*|wouter|@tanstack|lucide-react|react-markdown|react-syntax-highlighter|remark-gfm|drizzle-orm)/)'
  ],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'mjs', 'cjs'],
};

export default config;