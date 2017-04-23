<template>
<div id="base">
	<Form class="login-form">
		<Form-item label="Username" :style="{ marginBottom: '5px' }">
			<Input type="text" name="login-user" placeholder="username" icon="person"></Input>
		</Form-item>
		<Form-item label="Password">
			<Input type="password" name="login-pass" placeholder="password" icon="locked"></Input>
		</Form-item>
		<Form-item :error="loginError">
			<Button type="success" @click="login" long>Log in</Button>
		</Form-item>
		<Form-item>
			<Button type="info" @click="$router.push('/register')" long>Register</Button>
		</Form-item>
	</Form>
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

<style lang="sass" scoped>
.login-form
	margin: auto
	width: 300px
</style>
