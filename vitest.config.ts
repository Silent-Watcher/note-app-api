import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['tests/**/*.ts', './src/**/*.test.ts', './src/**/*.spec.ts'],
		coverage: {
			provider: 'v8',
			enabled: true,
			reporter: ['html', 'json', 'text'],
			all: true,
			include: ['src/**/*.ts'],
		},
		environment: 'node',
	},
	resolve: {
		alias: {
			'#app': path.resolve(process.cwd(), 'src'),
		},
		conditions: ['my-package-dev'],
	},
});
