<template>
<div id="base-register">
	<div class="form">
		<b-field label="Username" message="Must not contain an @ symbol">
			<b-input name='login-user' required :maxlength="35" has-counter placeholder="username" icon="account"></b-input>
		</b-field>
		<b-field label="Password" message="Min 8 characters">
			<b-input name="login-pass" type="password" :maxlength="70" has-counter password-reveal required placeholder="password" icon="lock"></b-input>
		</b-field>
		<b-field label="Confirm Password">
			<b-input name="reg-confirm" type="password" required placeholder="password" icon="lock"></b-input>
		</b-field>
		<b-field label="Email">
			<b-input name="reg-email" type="email" required :maxlength="70" has-counter placeholder="catgirls@neko.shop" icon="email"></b-input>
		</b-field>
		<div class="field">
			<b-checkbox name="old-enough">I am 13+ years old</b-checkbox>
		</div>
		<button class="button is-primary" :class="{ 'is-loading': pending }" @click="register"><b-icon icon="account-plus"></b-icon>Register</button>
		<b-message v-show="registerError" type="is-danger" id="register-error" has-icon><b>Register Error:</b><br>{{ registerError }}</b-message>
	</div>
</div>
</template>

<script>
export default {
	data() {
		return {
			registerError: null,
			pending: false
		};
	},
	methods: {
		async register() {
			if (this.pending)
				return;
			this.pending = true;

			let username = document.getElementsByName('login-user')[0].value, // We'll keep these universal for auto login plugins
				password = document.getElementsByName('login-pass')[0].value,
				confirmPassword = document.getElementsByName('reg-confirm')[0].value,
				email = document.getElementsByName('reg-email')[0].value;

			if (!username || !password || !email) {
				return this.$dialog.alert({
					type: 'is-warning',
					hasIcon: true,
					title: 'Incomplete',
					message: 'Please complete all fields.'
				});
			}

			if (!document.getElementsByName('old-enough')[0].checked)
				return this.$dialog.alert({
					type: 'is-warning',
					hasIcon: true,
					title: 'Not old enough',
					message: 'You must be at least 13 years old to make an account.'
				});

			if (password !== confirmPassword)
				return this.$dialog.alert({
					type: 'is-warning',
					hasIcon: true,
					title: 'Password does not match',
					message: 'Make sure you typed your password right.'
				});

			try {
				let response = await this.$http.post(API_BASE_URL + 'register', { username, password, email });

				this.registerError = null;
				this.pending = false;

				return this.$dialog.alert({
					type: 'is-success',
					hasIcon: true,
					title: 'Account Created!',
					message: `Welcome ${username}! Before you can start using your account you'll need to verify your email using the link we've sent you. It may take a minute to show up.`,
					confirmText: 'Return to Home',
					onConfirm: () => {
						this.$router.push('/');
					}
				});
			} catch(error) {
				this.pending = false;

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
#base-register
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
		#register-error
			width: 100%
			margin: 10px 0 30px
</style>
