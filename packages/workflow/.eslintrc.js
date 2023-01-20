const { sharedOptions } = require('@quicksales.vn/eslint-config/shared');

/**
 * @type {import('@types/eslint').ESLint.ConfigData}
 */
module.exports = {
	extends: ['@quicksales.vn/eslint-config/base'],

	...sharedOptions(__dirname),

	rules: {
		'import/order': 'off', // TODO: remove this
	},
};
