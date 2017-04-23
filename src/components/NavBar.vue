<template>
<Menu class="navbar" mode="horizontal" theme="primary" :active-name="$router.currentRoute.path" @on-select="navigate">
	<div class="navbar-brand">
		<h1>Catgirls</h1>
	</div>
	<div class="navbar-user">
		<!-- <img :src="user.avatar || 'http://placehold.it/32x32'"> -->
		<Submenu v-if="loggedIn" name="profile">
			<template slot="title">{{ user.username }}</template>
			<Menu-item :name="'/user/' + user.id">Profile</Menu-item>
			<Menu-item name="/settings">Settings</Menu-item>
			<Menu-item name="/logout">Logout</Menu-item>
		</Submenu>
		<Menu-item v-if="!loggedIn" name="/login">Login</Menu-item>
	</div>
	<div class="navbar-nav">
		<Menu-item name="/">Home</Menu-item>
		<Menu-item name="/search/images">Search</Menu-item>
		<Menu-item name="/upload">Upload</Menu-item>
	</div>
</Menu>
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
		},
		navigate(path) {
			this.$router.push(path);
		}
	}
}
</script>

<style lang="sass" scoped>
.navbar
	border-radius: .25rem
	font-family: 'Nunito', sans-serif
	.navbar-brand
		float: left
		h1
			color: #fff
			margin-left: 1.5rem
	.navbar-nav
		text-align: center
		.ivu-menu-item
			float: none
			display: inline-block
			font-size: 1.25rem
	.navbar-user
		float: right
		.ivu-menu-submenu
			font-size: 1.25rem
			float: right
		.ivu-menu-item
			font-size: 1.25rem
		img
			margin-right: 1rem
			vertical-align: middle

.ivu-menu-submenu
	border-radius: .25rem
</style>
