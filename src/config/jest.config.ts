import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  moduleNameMapper: {
    'module_name_(.*)': '<rootDir>/substituted_module_$1.js',
  },
};

export default config;
