import globals from 'globals';
import { defineConfig } from 'eslint/config';
import rootConfig from '../eslint.config.mts';

// pnpm add -D tsx@latest eslint@latest globals@latest

export default defineConfig([
  {
    extends: [rootConfig],
    languageOptions: {
      globals: {
        ...globals.mocha
      }
    }
  }
]);
