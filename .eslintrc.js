// http://eslint.org/docs/user-guide/configuring

module.exports = {
	root: true,
	parser: 'babel-eslint',
	parserOptions: {
		ecmaVersion: 2017,
		sourceType: 'module',
		ecmaFeatures: {
			experimentalObjectRestSpread: true,
		},
	},
	env: {
		browser: true,
	},
	// required to lint *.vue files
	plugins: [
		'html'
	],
	// check if imports actually resolve
	settings: {
		'import/resolver': {
			'webpack': {
				'config': 'build/webpack.base.conf.js'
			}
		}
	},
	rules: {
		// don't require .vue extension when importing
		// 'import/extensions': ['error', 'always', {
		// 	'js': 'never',
		// 	'vue': 'never'
		// }],
		// allow optionalDependencies
		// 'import/no-extraneous-dependencies': ['error', {
		// 	'optionalDependencies': ['test/unit/index.js']
		// }],
		// allow debugger during development
		'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
		"no-console": 0,
		"no-control-regex": 0,
		"no-alert": 1,
		"no-else-return": 1,
		"no-redeclare": 2,
		"no-useless-escape": 1,
		"no-inner-declarations": 0,
		"array-bracket-spacing": ["warn", "never"],
		"brace-style": ["warn", "1tbs", {
			"allowSingleLine": true
		}],
		"no-trailing-spaces": 1,
		"space-before-function-paren": ["warn", "never"],
		"arrow-spacing": 1,
		"comma-spacing": ["warn", {
			"before": false,
			"after": true
		}],
		"indent": ["error", "tab", {
			"SwitchCase": 1
		}],
		'array-callback-return': 'error',
		'consistent-return': 'error',
		eqeqeq: ['warn', 'always', { null: 'ignore' }],
		'no-empty-function': ['error', {
			allow: [
				'arrowFunctions',
				'functions',
				'methods',
			]
		}],
		'no-eval': 'error',
		'no-implied-eval': 'error',
		'no-return-assign': 'error',
		'no-unmodified-loop-condition': 'off',
		'no-dupe-keys': 'error',
		'no-empty': 'error',
		'no-extra-semi': 'error',
		'no-invalid-regexp': 'error',
		'no-irregular-whitespace': 'error',
		'no-regex-spaces': 'error',
		'no-unreachable': 'error',
		'valid-typeof': ['error', { requireStringLiterals: true }],
		'constructor-super': 'error',
		'no-const-assign': 'error',
		'no-dupe-class-members': 'error',
		'no-var': 'error',
		'object-shorthand': ['error', 'always', {
			ignoreConstructors: false,
			avoidQuotes: true,
		}],
		'block-spacing': ['error', 'always'],
		'eol-last': ['error', 'always'],
	}
}
