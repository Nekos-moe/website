require('babel-register')
const config = require('../../config')

// http://nightwatchjs.org/guide#settings-file
module.exports = {
	src_folders: ['test/e2e/specs'],
	output_folder: 'test/e2e/reports',
	custom_assertions_path: ['test/e2e/custom-assertions'],

	selenium: {
		start_process: true,
		server_path: require('selenium-server').path,
		host: '127.0.0.1',
		port: 4444,
		cli_args: {
			'webdriver.chrome.driver': require('chromedriver').path
		}
	},

	test_settings: {
		default: {
			selenium_port: 4444,
			selenium_host: 'localhost',
			silent: true,
			globals: {
				devServerURL: 'http://localhost:' + (process.env.PORT || config.dev.port)
			}
		},

		chrome: {
			desiredCapabilities: {
				browserName: 'chrome',
				javascriptEnabled: true,
				acceptSslCerts: true
			}
		},

		travis: {
			desiredCapabilities: {
				browserName : "chrome",
				javascriptEnabled: true,
				databaseEnabled: true,
				locationContextEnabled: true,
				applicationCacheEnabled: true,
				browserConnectionEnabled: true,
				webStorageEnabled: true,
				acceptSslCerts: true,
				rotatable: true,
				nativeEvents: true,
				chromeOptions: {
					args: ["disable-web-security", "ignore-certificate-errors", "no-sandbox"]
				}
			}
		},

		firefox: {
			desiredCapabilities: {
				browserName: 'firefox',
				javascriptEnabled: true,
				acceptSslCerts: true
			}
		}
	}
}
