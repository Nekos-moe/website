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
		&copy; Brussell 2018 &nbsp;|&nbsp; <a href="https://brussell.me">brussell.me</a><br>
		GitHub: <a href="https://github.com/brussell98/catgirls-website" target="_blank">Website</a>, <a href="https://github.com/brussell98/catgirls-api" target="_blank">API</a> &nbsp;|&nbsp; <a href="https://docs.nekos.moe/" target="_blank">API docs</a>
	</footer>
</div>
</template>

<script>
export default {
	beforeMount() {
		this.$store.dispatch('getSelf');
	},
	mounted() {
		// When App.vue is finish loading finish the progress bar
		this.$Progress.finish();
	},
	created() {
		console.log('%cHey you! Interested in contributing to Nekos.moe? Check out our repos:\n%chttps://github.com/brussell98/catgirls-website\nhttps://github.com/brussell98/catgirls-api\nhttps://github.com/Nekos-moe/docs', 'font-size: 16px; color: #F66D9B', 'text-decoration: underline; color: #039be5')

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
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%2396abec' fill-opacity='0.3' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")

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

.modal
	.modal-content
		width: unset
	.modal-image
		width: unset
		margin: auto

.media-content
	overflow: inherit

</style>
