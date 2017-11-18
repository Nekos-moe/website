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
		&copy; Brussell 2017 &nbsp;|&nbsp; <a href="mailto:brusselldesu@gmail.com">Contact</a><br>
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

		if (this.$store.state.lastUpdateMessage !== 'beta6') {
			this.$Modal.info({
				title: 'New Update!',
				content: "It's been two months since the website last got an update, so let's go over what's changed since then.<br><br>Most noticeable is that I've polished most of the pages. There's small things like moving and re-styling buttons, and then there's big changes like changing the layout of the home and image search page. Both pages now have much less wasted space. <br><br>Time for some fixes. I've fixed some annoying errors such as not being able to view posts while logged out. Sorting by likes no longer puts the most liked posts at the end. The default search order no-longer shows the oldest images on the site. Messages actually show up when you upload an image. Now you can actually add tags to a post instead of just removing them. How did I not catch any of that stuff before?<br><br>There's one more thing that anyone on a slow connection might like: <b>thumbnails</b>. When browsing images it now loads thumbnails instead of the full image. No more downloading 20MB every time you visit the site.<br><br>Anyways that's pretty much everything for this update. Enjoy the cat girls, and I'll see you next update.<br> - Brussell <small>(Lead Developer)</small>",
				onOk: () => { this.$store.commit('lastUpdateMessage', 'beta6'); }
			});
		}
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

body
	font-size: 100%

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

#app > footer
	text-align: center
	color: #777
	font-family: 'Nunito', sans-serif
	margin: 1rem 0

.page-wrapper
	margin-top: 10px
	margin-bottom: 10px
	height: 32px

.ivu-btn:not(.ivu-btn-small)
	font-size: 1rem

.ivu-form .ivu-form-item-label
	font-size: 14px

</style>
