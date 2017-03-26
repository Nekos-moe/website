<template>
<body>
	<div id="base">
		<div class="login">
			<label for="user">Username: 35 characters max</label>
			<input id="login-user" type="text" name="user" value="" placeholder="Username" maxlength="35" required>
			<label for="pass">Password: 8-70 characters<br>Must contain lowercase and uppercase alphabetic characters and numbers</label>
			<input id="login-pass" type="password" name="pass" value="" placeholder="Password" maxlength="70" required>
			<label for="email">Email: 70 charcters max</label>
			<input id="email" type="email" name="email" value="" placeholder="catgirls@neko.shop" autocomplete="on" maxlength="70" required>
			<button @click="register">Register</button>
			<p class="error" v-if="registerError">{{ registerError }}</p>
		</div>
	</div>
</body>
</template>

<script>
export default {
	data() {
		return {
			registerError: null
		};
	},
	methods: {
		async register() {
			let username = document.getElementById('login-user').value, // We'll keep these universal for auto log in plugins
				password = document.getElementById('login-pass').value,
				email = document.getElementById('email').value;

			if (!username || !password || !email) {
				this.$parent.$data.modalData = {
					body: 'You need to fill in each field',
					type: 'warning'
				};
				return
			}

			try {
				let response = await this.$http.post(API_BASE_URL + 'register', { username, password, email });

				this.registerError = null;

				this.$parent.$data.modalData = {
					title: 'Account created',
					body: `Welcome ${username}! Before you can start using your account you'll need to verify your email using the link we've sent you. It may take a minute to show up.`,
					link: '/',
					linkText: 'Return to home'
				};
			} catch(error) {
				if (!error.response) {
					console.error(error.message);
					this.registerError = 'Encountered an error';
				} else if (!error.response.data.message) {
					console.error(error.response);
					this.registerError = 'Encountered an error';
				} else
					this.registerError = error.response.data.message;
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
