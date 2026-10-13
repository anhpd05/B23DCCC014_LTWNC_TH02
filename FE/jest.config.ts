import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }] },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleNameMapper: {
    // `shared/env` đọc `import.meta.env` — CommonJS không chạy được, thay bằng stub.
    '^(\\.{1,2}/)+(shared/)?env$': '<rootDir>/test/env.ts',
    '\\.css$': '<rootDir>/test/styleStub.ts',
  },
  collectCoverageFrom: ['src/features/**/*.{ts,tsx}', '!src/**/__tests__/**'],
  // `global: {}` để thoả type `Config`; ngưỡng thật đặt cho thư mục features.
  coverageThreshold: { global: {}, './src/features/': { statements: 70 } },
};

export default config;
