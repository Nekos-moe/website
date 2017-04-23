<template>
<div id="base-register">
	<div class="register">
		<Form class="login-form" label-position="top">
			<Form-item label="Username: 35 characters max">
				<Input type="text" name="login-user" placeholder="username" icon="person"></Input>
			</Form-item>
			<Form-item label="Password: 8-70 characters">
				<Input type="password" name="login-pass" placeholder="password" icon="locked"></Input>
			</Form-item>
			<Form-item label="Email: 70 charcters max">
				<Input name="email" placeholder="catgirls@neko.shop" icon="email"></Input>
			</Form-item>
			<Form-item :error="registerError">
				<Button type="success" @click="register" long>Register</Button>
			</Form-item>
		</Form>
	</div>
</div>
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
			let username = document.getElementsByName('login-user')[0].value, // We'll keep these universal for auto log in plugins
				password = document.getElementsByName('login-pass')[0].value,
				email = document.getElementsByName('email')[0].value;

			if (!username || !password || !email) {
				this.$Modal.warning({
					title: 'Incomplete Form',
					content: 'Please fill in each field'
				});
				return
			}

			try {
				let response = await this.$http.post(API_BASE_URL + 'register', { username, password, email });

				this.registerError = null;

				this.$Modal.success({
					title: 'Account Created!',
					content: `Welcome ${username}! Before you can start using your account you'll need to verify your email using the link we've sent you. It may take a minute to show up.`,
					okText: 'Return to Home',
					onOk: () => {
						this.$router.push('/');
					}
				});
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
.register
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
