import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }] },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/)+(shared/)?env$': '<rootDir>/test/env.ts',
    '\\.css$': '<rootDir>/test/styleStub.ts',
  },
  collectCoverageFrom: ['src/features/**/*.{ts,tsx}', '!src/**/__tests__/**'],
  coverageThreshold: { global: {}, './src/features/': { statements: 70 } },
};

export default config;
