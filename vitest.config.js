import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './tests/setup.js',
        exclude: ['mobile/**', 'node_modules/**', 'dist/**', '.idea/**', '.git/**', '.cache/**']
    },
});
