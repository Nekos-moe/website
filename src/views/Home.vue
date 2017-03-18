<template>
<div id="base">
	<div class="account-view" v-if="loggedIn">
		<div class="icon-text-wrapper user">
			<img :src="user.avatar || 'http://placehold.it/32x32'" class="avatar-small">
			<span class="username">{{ user.username }}</span>
		</div>
		<div class="icon-text-wrapper mess">
			<img src="http://placehold.it/20x20">
			<span>{{ user.notifications | humanize }} Notifications</span>
		</div>
		<div class="icon-text-wrapper like">
			<img src="http://placehold.it/20x20">
			<span>{{ user.likes | humanize }} Likes</span>
		</div>
		<div class="icon-text-wrapper fav">
			<img src="http://placehold.it/20x20">
			<span>{{ user.favorites | humanize }} Favorites</span>
		</div>
	</div>
	<div class="account-view" v-if="hasToken && loggedIn === null">
		<div class="icon-text-wrapper user">
			<img src="http://placehold.it/32x32" class="avatar-small">
			<span class="username">Loading...</span>
		</div>
	</div>
	<div class="account-view" v-if="!hasToken || loggedIn === false">
		<div class="login">
			<input id="login-user" type="text" value="" placeholder="Username">
			<input id="login-pass" type="password" value="" placeholder="Password">
			<button @click="login">Log in</button>
			<hr>
			<button @click="$router.push('/register')">Register</button>
			<p class="error" v-if="loginError">{{ loginError }}</p>
		</div>
	</div>
	<div class="images-wrapper">
		<div class="navigation-buttons">
			<button @click="previous">Previous</button>
			<button @click="next">Next</button>
		</div>
		<div class="images">
			<transition-group name="slide-in">
				<div class="image-page" v-for="(im, i) of images" v-show="i === page - 1" v-if="Math.abs(i - (page - 1)) < 2" :key="i">
					<image-preview v-for="image of im" :image="image" :key="image.id"></image-preview>
				</div>
			</transition-group>
		</div>
		<div class="navigation-buttons">
			<button @click="previous">Previous</button>
			<button @click="next">Next</button>
		</div>
	</div>
</div>
</template>

<script>
export default {
	data() {
		return {
			IMAGE_BASE_URL,
			images: [],
			page: 1,
			loginError: null,
			direction: 'right'
		};
	},
	computed: {
		user() {
			return this.$store.state.user;
		},
		hasToken() {
			return this.$store.state.hasToken;
		},
		loggedIn() {
			return this.$store.state.loggedIn;
		}
	},
	methods: {
		previous() {
			if (this.page !== 1) {
				this.direction = 'left';
				this.page--;
			}
		},
		next() {
			if (this.page < this.images.length) {
				this.direction = 'right';
				this.page++;
			} else if (this.images.length !== 0 && this.images.length % 3 === 0 && this.images[this.images.length - 1] % 9 === 0 && this.images.length === this.page) {
				this.getResults();
				this.direction = 'right';
				this.page++;
			}
		},
		async login() {
			let username = document.getElementById('login-user').value;
			let password = document.getElementById('login-pass').value;

			try {
				let response = await this.$http.post(API_BASE_URL + 'auth', { username, password }, { responseType: 'json' })

				this.loginError = null;
				this.$store.commit('hasToken', true);
				localStorage.setItem('token', response.data.token);
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
		},
		async getImages() {
			try {
				let response = await this.$http.post(API_BASE_URL + 'images/search', {
					sort: 'recent',
					limit: 27,
					skip: this.page !== 1 ? this.page * 9 : 0,
					nsfw: this.$store.getters.NSFWImages,
					tags: this.$store.getters.blacklist
				}, {
					responseType: 'json',
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				});

				while (response.data.images.length > 0)
					this.images.push(response.data.images.splice(0, 9));

				return response;
			} catch(error) {
				console.error(error);
				this.$parent.$data.modalMessage = {
					title: 'Request Error',
					body: error.response && error.response.data.message || error.message,
					type: 'error'
				};
			}
		}
	},
	beforeMount() {
		this.getImages();
	}
}
</script>

<style lang="sass" scoped>
#base
	display: flex
	.account-view
		box-sizing: border-box
		flex-basis: 256px
		padding: 1rem
		box-shadow: 0 0 3px #CCC
		border-radius: .25rem
		font-family: 'Nunito', sans-serif
		input
			box-sizing: border-box
			margin-bottom: .5rem
			padding: 4px 8px
			width: 100%
			font-family: 'Nunito', sans-serif
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
			font-family: 'Nunito', sans-serif
			font-size: 16px
			color: #FFF
			background-color: #4ACFFF
			box-shadow: 0 0 3px rgba(#4ACFFF, .4)
			border: none
			border-radius: 3px
			transition: background .3s
			&:hover, &:focus
				background: darken(#4ACFFF, 15)
		hr
			box-sizing: content-box
			margin-left: -1rem
			margin-right: -1rem
			border: none
			border-top: 1px solid #ECECEC
		hr ~ button
			margin-top: 0

		.icon-text-wrapper
			display: table
			margin-bottom: .5rem
			img
				vertical-align: middle
			span
				display: table-cell
				vertical-align: middle
				padding-left: .5rem
			&:last-of-type
				margin-bottom: 0
		.user
			margin-bottom: 1rem
			overflow: hidden
			white-space: nowrap
			text-overflow: ellipsis
			.avatar-small
				width: 32px
				height: 32px
				vertical-align: middle
			.username
				font-size: 1.2rem
		.mess
			color: #5ee03a
		.like
			color: #47dced
		.fav
			color: #ed4778
	.images-wrapper
		max-width: 1024px
		flex-basis: 1024px
		margin-left: 1rem
		box-sizing: border-box
		.navigation-buttons
			text-align: center
			button
				padding: 5px 10px
				border-radius: 3px
				background-color: #2de58c
				color: #FFF
				box-shadow: 0 0 3px rgba(45, 229, 140, .4)
				border: none
				font-family: 'Nunito', sans-serif
				font-size: 1rem
				font-weight: bold
				margin: .5rem
				width: 100px
				transition: background .3s
				&:hover
					cursor: pointer
					background-color: darken(#2de58c, 15)
		.image-page
			display: flex
			flex-wrap: wrap
			justify-content: space-around
			&.slide-in-leave-active > div
				animation: slide-out-bck-center 0.4s cubic-bezier(0.550, 0.085, 0.680, 0.530) both

		// Once other element leaves, enter new element
		.image-page:not(.slide-in-leave-active) + .image-page, .image-page:first-of-type
			div
				animation: slide-in-fwd-center 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both

		// Hide entering element until other leaves
		.slide-in-leave-active + .image-page, .image-page + .slide-in-leave-active
			display: none

</style>
