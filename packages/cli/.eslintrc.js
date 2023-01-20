const { sharedOptions } = require('@quicksales.vn/eslint-config/shared');

/**
 * @type {import('@types/eslint').ESLint.ConfigData}
 */
module.exports = {
	extends: ['@quicksales.vn/eslint-config/node'],

	...sharedOptions(__dirname),

	ignorePatterns: [
		'jest.config.js',
		// TODO: Remove these
		'src/databases/migrations/**',
		'src/databases/ormconfig.ts',
	],

	rules: {
		// TODO: Remove this
		'import/no-cycle': 'warn',
		'import/order': 'off',
		'import/extensions': 'off',
		'@typescript-eslint/ban-ts-comment': ['warn', { 'ts-ignore': true }],
	},
};
