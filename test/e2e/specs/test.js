// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
	'main e2e test': function test(browser) {
		// automatically uses dev Server port from /config.index.js
		// default: http://localhost:8080
		// see nightwatch.conf.js
		const devServer = browser.globals.devServerURL;

		browser
			.maximizeWindow()
			.url(devServer)
			.waitForElementVisible('#app', 20000)
			.pause(5000)
			.assert.elementPresent('.post-grid-wrapper')
			.assert.elementCount('.page .card', 9)
			// .click('.navigation-buttons button + button').pause(1000)
			// .click('.navigation-buttons button + button').pause(1000)
			// .assert.hidden('.images div:first-of-type img')
			// .assert.visible('.images div:last-of-type img')
			// .click('.navigation-buttons button + button').pause(500)
			// .assert.visible('.images div:last-of-type img')
			.end();
	},
};
