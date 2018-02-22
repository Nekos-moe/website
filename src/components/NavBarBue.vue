<template>
<nav id="navbar" class="navbar is-primary">
	<div class="navbar-brand">
		<router-link class="navbar-item is-size-4 has-text-weight-bold" to="/">Catgirls</router-link>

		<button class="button is-primary navbar-burger" @click="toggleMenu">
			<span></span>
			<span></span>
			<span></span>
		</button>
	</div>
	<div class="navbar-menu">
		<div class="navbar-start">
			<router-link class="navbar-item is-size-5-desktop" to="/"><b-icon icon="home"></b-icon>Home</router-link>
			<router-link class="navbar-item is-size-5-desktop" to="/search/images"><b-icon icon="format-list-bulleted"></b-icon>Posts</router-link>
			<router-link class="navbar-item is-size-5-desktop" to="/search/users"><b-icon icon="account-multiple"></b-icon>Users</router-link>
			<router-link class="navbar-item is-size-5-desktop" to="/upload"><b-icon icon="upload"></b-icon>Upload</router-link>
		</div>

		<div class="navbar-end">
			<b-dropdown v-if="loggedIn && user.roles && user.roles.length" position="is-bottom-left" hoverable>
				<a class="navbar-item has-text-white is-size-5-desktop" slot="trigger">
					<span>Admin</span><b-icon icon="menu-down"></b-icon>
				</a>

				<b-dropdown-item v-if="loggedIn && user.roles && (user.roles.includes('admin') || user.roles.includes('approver'))" has-link>
					<router-link to="/pending"><b-icon icon="checkbox-marked-outline"></b-icon><span>Pending Posts</span></router-link>
				</b-dropdown-item>
			</b-dropdown>

			<b-dropdown v-if="loggedIn" position="is-bottom-left" hoverable>
				<a class="navbar-item has-text-white is-size-5-desktop" slot="trigger">
					<span>My Account</span><b-icon icon="menu-down"></b-icon>
				</a>

				<b-dropdown-item custom><b>{{ user.username }}</b></b-dropdown-item>

				<hr class="dropdown-divider">

				<b-dropdown-item has-link>
					<router-link :to="'/user/' + user.id"><b-icon icon="account"></b-icon><span>Profile</span></router-link>
				</b-dropdown-item>

				<hr class="dropdown-divider">

				<b-dropdown-item has-link>
					<router-link to="/settings"><b-icon icon="settings"></b-icon><span>Settings</span></router-link>
				</b-dropdown-item>
				<b-dropdown-item @click="logoutUser">
					<b-icon icon="logout"></b-icon><span>Log Out</span>
				</b-dropdown-item>
			</b-dropdown>

			<b-dropdown v-if="!loggedIn" position="is-bottom-left">
				<a class="navbar-item has-text-white is-size-5-desktop" slot="trigger">
					<b-icon icon="login"></b-icon>
					<span>Log In</span>
				</a>

				<b-dropdown-item custom paddingless>
					<div class="modal-card" style="width:300px;">
						<section class="modal-card-body">
							<b-field label="Username">
								<b-input v-model="login.username" name="login-user" placeholder="Username" required></b-input>
							</b-field>

							<b-field label="Password">
								<b-input v-model="login.password" name="login-pass" type="password" password-reveal placeholder="Password" required></b-input>
							</b-field>
						</section>
						<footer class="modal-card-foot">
							<button id="nav-login-button" class="button is-primary" @click="loginUser">Log In</button>
							<button class="button is-primary is-outlined" @click="$router.push('/register')">Register</button>
							<b-message :active.sync="isLoginErrorActive" type="is-danger">{{ loginError }}</b-message>
						</footer>
					</div>
				</b-dropdown-item>
			</b-dropdown>
		</div>
	</div>
</nav>
</template>

<script>
export default {
	data() {
		return {
			login: {
				username: '',
				password: ''
			},
			loginError: '',
			isLoginErrorActive: false
		};
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
		toggleMenu(e) {
			e.target.classList.toggle('is-active');
			return document.querySelector('.navbar-menu').classList.toggle('is-active');
		},
		async loginUser() {
			let btn = document.querySelector('#nav-login-button');

			try {
				btn.classList.add('is-loading');

				let resp = await this.$http.post(API_BASE_URL + 'auth', {
					username: this.login.username,
					password: this.login.password
				});

				this.loginError = '';
				this.isLoginErrorActive = false;

				this.$store.commit('hasToken', true);
				localStorage.setItem('token', resp.data.token);
				this.$store.dispatch('getSelf').then(() => {
					let el = document.querySelector('.dropdown.is-active');
					el && el.classList.remove('is-active');
				});

				btn.classList.remove('is-loading');

			} catch(error) {
				if (!error.response) {
					console.error(error.message);
					this.loginError = 'Encountered an error';
				} else if (!error.response.data.message) {
					console.error(error.response);
					this.loginError = 'Encountered an error';
				} else
					this.loginError = error.response.data.message;

				this.isLoginErrorActive = true;
				btn.classList.remove('is-loading');
			}
		}
	}
}
</script>

<style lang="sass">
#navbar
	font-family: 'Nunito', sans-serif
	box-shadow: 0 0 3px #464c5b
	.navbar-brand button
		box-shadow: none !important
	.dropdown
		.navbar-item:hover
			background-color: #809ae8
			color: #fff !important
		.dropdown-menu a span + span
			vertical-align: middle
		.modal-card-foot
			background-color: white
			display: inline-block
			article
				margin-top: 10px
				section
					padding: .75em
	a > .icon
		margin-right: 6px
		height: 1rem
		width: 1rem
		vertical-align: sub
		i::before
			font-size: 19px

</style>
