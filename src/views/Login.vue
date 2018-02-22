<template>
<div id="base-login">
	<div class="form">
		<b-field label="Username">
			<b-input name='login-user' required placeholder="username" icon="account"></b-input>
		</b-field>
		<b-field label="Password">
			<b-input name="login-pass" type="password" password-reveal required placeholder="password" icon="lock"></b-input>
		</b-field>
		<button class="button is-primary" @click="login"><b-icon icon="login"></b-icon>Log In</button>
		<button class="button is-primary is-outlined" @click="$router.push('/register')"><b-icon icon="account-plus"></b-icon>Register</button>
		<b-message v-show="loginError" type="is-danger" id="login-error" has-icon><b>Login Error:</b><br>{{ loginError }}</b-message>
	</div>
</div>
</template>

<script>
export default {
	data() {
		return {
			loginError: null
		};
	},
	methods: {
		async login() {
			let username = document.getElementsByName('login-user')[0].value,
				password = document.getElementsByName('login-pass')[0].value;

			try {
				let response = await this.$http.post(API_BASE_URL + 'auth', { username, password });

				this.loginError = null;
				this.$store.commit('hasToken', true);
				localStorage.setItem('token', response.data.token);
				this.$store.dispatch('getSelf');

				let returnTo = this.$router.currentRoute.query.returnTo;
				this.$router.push(returnTo || '/');
			} catch(error) {
				if (!error.response) {
					console.error(error.message);
					this.loginError = 'Encountered an error';
				} else if (!error.response.data.message) {
					console.error(error.response);
					this.loginError = 'Encountered an error';
				} else
					this.loginError = error.response.data.message;
			}
		}
	}
}
</script>

<style lang="sass">
#base-login
	.button .icon:first-child:last-child
		margin-left: 0
		margin-right: 6px

	.form
		margin: auto
		width: 400px
		.button
			width: 100%
			&:first-of-type
				margin: 30px 0 20px
		#login-error
			width: 100%
			margin-top: 30px
</style>
