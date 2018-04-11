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
			.waitForElementVisible('#app', 20000).pause(5000)
			// .click('.dialog.modal footer button').pause(1000)
			.assert.elementCount('#randomTags .tag-list a', 20, 'Random tags present')
			.assert.elementPresent('#topPosts .post-previews')
			.assert.elementCount('#topPosts .post-previews img', 8, 'Post previews displaying on page')

			.click('.navbar .navbar-burger').pause(250)
			.click('.navbar a[href="/search/images"]').pause(1000)
			.click('.navbar .navbar-burger').pause(250)
			.assert.urlContains('/search/images', 'Navigated to search images page')
			.click('.search-wrapper .submit').pause(5000)
			.assert.elementPresent('.post-grid-wrapper', 'Search results shown')
			.assert.elementCount('.page .card', 9, 'Search results shown')
			.click('.post-grid-wrapper .pagination-next').pause(1000)
			.assert.containsText('.pagination-list .pagination-link.is-current', '2', 'Pagination changed page')
			.assert.elementCount('.page .card', 9)
			.click('.page .card-image img').pause(1000)
			.assert.elementPresent('.modal-image', 'Image expand modal opened')
			.click('.modal-close').pause(1000)
			.assert.elementNotPresent('.modal-image', 'Image expand modal closed')

			.end();
	},
};
