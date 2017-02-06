<template>
	<div id="app">
		<nav-bar>
			<router-link to="/" exact>Home</router-link>
			<router-link to="/about">About</router-link>
		</nav-bar>
		<div class="body-wrapper">
			<transition name="fade" mode="out-in">
				<router-view></router-view>
			</transition>
		</div>
	</div>
</template>

<script>
	export default {
		beforeMount() {
			this.$store.dispatch('getUser');
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
</style>
