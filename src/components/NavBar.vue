<template>
	<div class="nav-wrap">
		<router-link to="/" exact class="brand">Catgirls</router-link>
		<router-link to="/login" class="login" v-if="!loggedIn">Login</router-link>
		<div class="account dropdown" v-if="loggedIn">
			<img :src="user.avatar || 'http://placehold.it/32x32'">
			<span>{{ user.username }}</span>
			<div class="arrow"></div>
			<div class="dropdown-content">
				<a href="#">Account</a>
				<a href="#">Settings</a>
				<a id="logout" @click="logoutUser()">Logout</a>
			</div>
		</div>
		<div class="nav">
			<slot></slot>
		</div>
	</div>
</template>

<script>
export default {
	computed: {
		user() {
			return this.$store.state.user;
		},
		loggedIn() {
			return this.$store.state.loggedIn;
		}
	},
	methods: {
		logoutUser() {
			this.$store.commit('logout');
			this.$router.push('/');
		}
	}
}
</script>

<style lang="sass" scoped>
.nav-wrap
	font-family: sans-serif
	background-color: #2de58c
	box-shadow: 0 0 3px rgba(45, 229, 140, .2)
	padding: 0 1rem
	border-radius: .25rem
	a
		font-size: 1.5rem
		color: rgba(255, 255, 255, .75)
		text-decoration: none
		transition: color .2s
		margin: 0 .5rem
		padding: .5rem 1rem
		&.router-link-active
			color: #FFF
		&.brand
			float: left
			color: #FFF
			font-weight: bold
			width: 100px
		&.login
			float: right
			width: 100px
			float: right
			text-align: right
		&:hover
			color: #FFF
	.nav
		display: flex
		flex-wrap: nowrap
		justify-content: flex-start
	.account
		display: table
		float: right
		span
			max-width: 200px
			overflow: hidden
			white-space: nowrap
			text-overflow: ellipsis
			display: table-cell
			vertical-align: middle
			font-size: 1.5rem
			color: #FFF
			margin: 0 .5rem
			padding: .5rem 1rem
		img
			margin: 6.5px 0
			vertical-align: middle
		.arrow
			border-style: solid
			border-width: 5px 5px 0 5px
			border-color: #FFF transparent transparent transparent
			margin-left: -8px
		.dropdown-content
			a
				cursor: pointer
				box-sizing: border-box
				display: block
				font-size: 1.2rem
				text-align: center
				width: 100%
				padding: 3px 30px
				margin: 0
				transition: background-color .2s
				&:hover
					background-color: darken(#2de58c, 10)
				&:last-of-type
					border-radius: 0 0 .25rem .25rem
	.dropdown
		position: relative
		&:hover
			.dropdown-content
				visibility: visible
				transform: translateY(0)
				opacity: 1
				z-index: 1
				transition-delay: 0s, 0s, .3s
	.dropdown-content
		background-color: #2de58c
		box-shadow: 0 0 3px rgba(45, 229, 140, .2)
		margin-top: 18px
		border-radius: 0 0 .25rem .25rem
		visibility: hidden
		opacity: 0
		position: absolute
		z-index: -1
		right: 0
		transform: translateY(-2em)
		transition: all .3s ease-in-out, visibility 0s linear .3s, z-index 0s linear .01s
</style>
