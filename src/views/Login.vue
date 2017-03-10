<template>
<body>
	<div id="base">
		<div class="login">
			<input id="login-user" type="text" value="" placeholder="Username" autofocus="on">
			<input id="login-pass" type="password" value="" placeholder="Password">
			<button type="button" @click="login">Log in</button>
			<p class="error" v-if="loginError">{{ loginError }}</p>
		</div>
	</div>
</body>
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
			let username = document.getElementById('login-user').value;
			let password = document.getElementById('login-pass').value;

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

<style lang="sass" scoped>
.login
	margin: auto
	width: 300px
	input
		box-sizing: border-box
		margin-bottom: .5rem
		padding: 4px 8px
		width: 100%
		font-size: 14px
		border: 1px solid #CCC
		border-radius: 3px
		outline: #4ACFFF auto 0
		margin-bottom: .5rem
		&:focus
			border-color: #4ACFFF
			outline: #4ACFFF auto 5px
	button
		margin-top: .5rem
		padding: 5px 10px
		width: 100%
		cursor: pointer
		font-size: 16px
		color: #FFF
		background-color: #4ACFFF
		box-shadow: 0 0 3px rgba(#4ACFFF, .4)
		border: none
		border-radius: 3px
		transition: background .3s
		&:hover, &:focus
			background: darken(#4ACFFF, 15)
</style>
