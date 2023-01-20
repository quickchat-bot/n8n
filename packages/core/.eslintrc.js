const { sharedOptions } = require('@quicksales.vn/eslint-config/shared');

/**
 * @type {import('@types/eslint').ESLint.ConfigData}
 */
module.exports = {
	extends: ['@quicksales.vn/eslint-config/node'],

	...sharedOptions(__dirname),

	ignorePatterns: ['bin/*.js'],

	rules: {
		// TODO: Remove this
		'import/order': 'off',
		'@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': true }],
	},
};
