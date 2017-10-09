<template>
<div id="navbar">
	<Menu class="_navbar" mode="horizontal" theme="primary" :active-name="$router.currentRoute.path" @on-select="navigate">
		<div class="navbar-user">
			<Menu-item v-if="loggedIn && (user.roles.includes('admin') || user.roles.includes('approver') )" name="/pending">Pending Posts</Menu-item>
			<Menu-item v-if="loggedIn" :name="'/user/' + user.id">Profile</Menu-item>
			<Menu-item v-if="loggedIn" name="/settings">Settings</Menu-item>
			<Menu-item v-if="loggedIn" name="/logout">Logout</Menu-item>
			<img v-if="loggedIn" :src="user.avatar || require('@/../assets/images/404.jpg')">
			<Menu-item v-if="!loggedIn" name="/login">Login</Menu-item>
		</div>
		<h1 class="_navbar-brand">Catgirls</h1>
		<div class="navbar-nav">
			<Menu-item name="/">Home</Menu-item>
			<Submenu name="search">
				<template slot="title">Search</template>
				<Menu-item name="/search/images">Images</Menu-item>
				<Menu-item name="/search/users">Users</Menu-item>
			</Submenu>
			<Menu-item name="/upload">Upload</Menu-item>
		</div>
	</Menu>

	<Menu class="_navbar-mobile" mode="vertical" theme="primary" :active-name="$router.currentRoute.path" @on-select="navigate">
		<Button icon="navicon-round" size="large" type="text" class="toggle" @click="showNav = !showNav"></Button>
		<h1 class="_navbar-brand">Catgirls</h1>
		<div class="navbar-nav" v-show="showNav">
			<Menu-item name="/">Home</Menu-item>
			<Submenu name="search">
				<template slot="title">Search</template>
				<Menu-item name="/search/images">Images</Menu-item>
				<Menu-item name="/search/users">Users</Menu-item>
			</Submenu>
			<Menu-item name="/upload">Upload</Menu-item>
			<Submenu v-if="loggedIn" name="User">
				<template slot="title">{{ user.username }}</template>
				<Menu-item :name="'/user/' + user.id">Profile</Menu-item>
				<Menu-item name="/settings">Settings</Menu-item>
				<Menu-item name="/logout">Logout</Menu-item>
			</Submenu>
			<Menu-item v-if="!loggedIn" name="/login">Login</Menu-item>
		</div>
	</Menu>
</div>
</template>

<script>
export default {
	data() {
		return { showNav: false };
	},
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

<style lang="sass">
#navbar
	font-family: 'Nunito', sans-serif

	@media (max-width: 960px)
		._navbar
			display: none

	@media (min-width: 961px)
		._navbar-mobile
			display: none

	._navbar
		box-shadow: 0 0 3px #464c5b
		._navbar-brand
			float: left
			margin-right: 40px
			color: #FFF
			margin-left: 1.5rem
			font-size: 2em
			font-weight: bold
		.navbar-nav
			.ivu-menu-item, .ivu-menu-submenu
				float: none
				display: inline-block
				font-size: 1.25rem
			.ivu-menu-submenu
				.ivu-menu-submenu-title > i
					margin-right: 0
				.ivu-menu-item
					display: block
					text-align: left
		.navbar-user
			position: absolute
			right: 0
			.ivu-menu-submenu
				font-size: 1.25rem
				float: right
			.ivu-menu-item
				font-size: 1.25rem
			img
				height: 60px
			.admin
				background: #ff9900
				&:hover
					background: darken(#ff9900, 5)

	.navbar-mobile
		background: #96abec
		padding: 4px 20px
		width: 100% !important
		box-shadow: 0 0 3px #464c5b
		.toggle
			vertical-align: middle
			float: right
			color: #FFF !important
			i
				font-size: 30px
		._navbar-brand
			color: #FFF
			font-size: 2rem
		.navbar-nav
			.ivu-menu-item
				color: #FFF
				font-size: 1rem
				padding: 6px 10px
				&:hover
					background: inherit
					text-decoration: underline
			.ivu-menu-submenu
				.ivu-menu-submenu-title
					color: #FFF
					font-size: 1rem
					padding: 6px 10px
					font-weight: bold
					&:hover
						background: inherit
				.ivu-menu-item
					margin-left: 1rem
</style>
