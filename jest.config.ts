import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@domains/(.*)$': '<rootDir>/src/domains/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@design-system/(.*)$': '<rootDir>/src/design-system/$1',
    '^@i18n/(.*)$': '<rootDir>/src/i18n/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/test/__mocks__/fileMock.ts',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          target: 'ES2022',
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          esModuleInterop: true,
          types: ['jest', '@testing-library/jest-dom'],
          paths: {
            '@/*': ['./src/*'],
            '@app/*': ['./src/app/*'],
            '@domains/*': ['./src/domains/*'],
            '@shared/*': ['./src/shared/*'],
            '@design-system/*': ['./src/design-system/*'],
            '@i18n/*': ['./src/i18n/*'],
            '@pages/*': ['./src/pages/*'],
          },
        },
      },
    ],
  },
  testMatch: ['**/__tests__/**/*.{ts,tsx}', '**/*.{spec,test}.{ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**',
    '!src/main.tsx',
    '!src/**/index.ts',
  ],
};

export default config;
