<template>
<div id="app">
	<vue-progress-bar></vue-progress-bar>
	<nav-bar-bue></nav-bar-bue>
	<div class="body-wrapper">
		<transition name="fade" mode="out-in">
			<router-view></router-view>
		</transition>
	</div>
	<footer>
		&copy; Brussell 2017 &nbsp;|&nbsp; <a href="https://brussell.me">brussell.me</a><br>
		Made with <a href="https://vuejs.org/" target="_blank">vuejs</a>. No Bootstrap, no jQuery. <a href="/api-docs/index.html" target="_blank">API docs here</a>
	</footer>
</div>
</template>

<script>
export default {
	data() {
		return { };
	},
	beforeMount() {
		this.$store.dispatch('getSelf');
	},
	mounted() {
		// When App.vue is finish loading finish the progress bar
		this.$Progress.finish();
	},
	created() {
		console.log("%cFind something wrong? You can submit an issue or PR on these repos:\n%chttps://github.com/brussell98/catgirls-website\nhttps://github.com/brussell98/catgirls-api", 'font-size: 16px; color: #ec407a', 'text-decoration: underline; color: #039be5')

		// When App.vue is first loaded start the progress bar
		this.$Progress.start();
		// hook the progress bar to start before we move router-view
		this.$router.beforeEach((to, from, next) => {
			// start the progress bar
			this.$Progress.start();
			next();
		});
		// hook the progress bar to finish after we've finished moving router-view
		this.$router.afterEach((to, from) => {
			this.$Progress.finish();
		});

		if (this.$store.state.lastUpdateMessage !== 'beta7')
			return this.$dialog.alert({
				type: 'is-info',
				title: 'New Update!',
				message: `It's been a while since the site got updated, but it's finally done! You'll notice some significant changes, as I've re-designed the entire site using <a href="https://buefy.github.io/" target="_blank">Buefy</a>. The version you see now is very close to what the site will be like when it leaves beta.<br><br>One major change is the new <del>image previews</del> post cards. They allow you to see information and perform actions without leaving the page. Clicking the thumbnail expands the image, buttons allow liking/favoriting, the uploader is shown, and post metadata is visible.<br><br>A change that uploaders will need to know is that all posts now require approval to be listed on the site. Until they are reviewed the will just be unlisted. Make sure you include detailed tags in your post (in the correct format) or it may be denied.<br><br>Lastly, I've finally added a basic settings page. You can now decide if you'd like NSFW posts visible by default and what you never want to see. In the next update this page will be expanded to include avatar uploading, password and email changing, and more.<br> - Brussell <small>(Lead Developer)</small>`,
				onConfirm: () => this.$store.commit('lastUpdateMessage', 'beta7'),
				canCancel: false
			});
	}
}
</script>

<style lang="sass">
@import "~bulma/sass/utilities/_all"

$primary: #96abec
$primary-invert: findColorInvert($primary)

// Setup $colors to use as bulma classes
$colors: (white: ($white, $black), black: ($black, $white), light: ($light, $light-invert), dark: ($dark, $dark-invert), primary: ($primary, $primary-invert), info: ($info, $info-invert), success: ($success, $success-invert), warning: ($warning, $warning-invert), danger: ($danger, $danger-invert))

// Links
$link: $primary
$link-invert: $primary-invert
$link-focus-border: $primary

@import "~bulma"
@import "~buefy/src/scss/buefy"

html
	background-image: url("../assets/images/60-lines.png")

body
	font-size: 100%
	background: transparent

#app
	font-family: 'Nunito', sans-serif
	.fade-enter-active, .fade-leave-active
		transition: all .2s ease
	.fade-enter, .fade-leave-active
		opacity: 0
	.body-wrapper
		max-width: 1280px
		margin: auto
		box-shadow: 0 0 3px #CCC
		margin-top: 1rem
		border-radius: .25rem
		padding: 1rem 2rem
		background-color: #fff
		& > div
			margin: 40px 0
	& > footer
		text-align: center
		color: #777
		font-family: 'Nunito', sans-serif
		margin: 1rem 0 2rem

.modal .modal-image
	width: unset
	margin: auto

</style>
