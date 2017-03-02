<template>
	<div id="app">
		<vue-progress-bar></vue-progress-bar>
		<nav-bar>
			<router-link to="/" exact>Home</router-link>
			<router-link to="/search/images">Search</router-link>
			<router-link to="/upload">Upload</router-link>
		</nav-bar>
		<div class="body-wrapper">
			<transition name="fade" mode="out-in">
				<router-view></router-view>
			</transition>
		</div>
		<footer>
			&copy; Brussell 2017 &nbsp;|&nbsp; <a href="mailto:brusselldesu@gmail.com" target="_blank">Contact</a><br>
			Made with <a href="https://vuejs.org/" target="_blank">vuejs</a>. No Bootstrap, no jQuery. <a href="http://jk" target="_blank">API docs here</a>
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
		// When App.vue is first loaded start the progress bar
		this.$Progress.start();
		// hook the progress bar to start before we move router-view
		this.$router.beforeEach((to, from, next) => {
			// start the progress bar
			this.$Progress.start();
			next();
		})
		// hook the progress bar to finish after we've finished moving router-view
		this.$router.afterEach((to, from) => {
			this.$Progress.finish();
		})
	}
}
</script>

<style lang="sass">
#app
	font-family: 'Nunito', sans-serif
	max-width: 1280px
	margin: auto
	margin-top: 2rem
	.fade-enter-active, .fade-leave-active
		transition: all .2s ease
	.fade-enter, .fade-leave-active
		opacity: 0
	.body-wrapper
		box-shadow: 0 0 3px #CCC
		margin-top: 1rem
		border-radius: .25rem
		padding: 1rem 2rem
	#base
		.error
			color: #A22

footer
	text-align: center
	color: #777
	font-family: 'Nunito', sans-serif
	margin-top: 1rem
	a
		color: #2de58c !important
		text-decoration: none
</style>
