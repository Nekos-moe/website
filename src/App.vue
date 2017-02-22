<template>
	<div id="app">
		<nav-bar>
			<router-link to="/" exact>Home</router-link>
			<router-link to="/search/images">Search</router-link>
		</nav-bar>
		<div class="body-wrapper">
			<transition name="fade" mode="out-in">
				<router-view></router-view>
			</transition>
		</div>
		<vue-progress-bar></vue-progress-bar>
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
		.images-wrapper
			box-sizing: border-box
			.navigation-buttons
				text-align: center
				button
					padding: 5px 10px
					border-radius: 3px
					background-color: #2de58c
					color: #FFF
					box-shadow: 0 0 3px rgba(45, 229, 140, .2)
					border: none
					font-size: 1rem
					font-family: sans-serif
					margin: .5rem
					width: 100px
					transition: background .3s
					&:hover
						cursor: pointer
						background-color: darken(#2de58c, 15)
			.images
				display: flex
				flex-wrap: wrap
				justify-content: space-around
				div
					display: flex
					justify-content: center
					align-items: center
					align-self: center
					margin: .3rem 0
					img
						max-height: 100%
						max-width: 100%
</style>
