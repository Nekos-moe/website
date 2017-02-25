<template>
<body>
	<div id="base">
		<div class="login">
			<input id="login-user" type="text" value="" placeholder="Username">
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
				let response = await this.$http.post(API_BASE_URL + 'auth', { username, password }, { responseType: 'json' })

				this.loginError = null;
				this.$store.commit('hasToken', true);
				localStorage.setItem('token', token);
				this.$store.dispatch('getSelf');
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

</style>
