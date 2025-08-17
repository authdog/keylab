import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: [
            'src/**/*.test.ts',
            'scripts/**/*.test.ts'
        ],
        exclude: [
            'node_modules',
            'dist',
            'docs',
            'coverage',
            'tsdoc'
        ],
        globals: true,
        environment: 'node',
        testTimeout: 25000,
        setupFiles: ['./vitest.setup.ts'],
        coverage: {
            provider: 'v8'
        }
    }
});


