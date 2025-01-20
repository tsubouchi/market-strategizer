import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: "react-jsx",
        module: "esnext",
        target: "ES2022",
        esModuleInterop: true,
        moduleResolution: "node"
      },
      useESM: true
    }]
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@?react.*|wouter|@tanstack|lucide-react|react-markdown|react-syntax-highlighter|remark-gfm)/)'
  ],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'mjs', 'cjs'],
};

export default config;