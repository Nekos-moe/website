<template>
<div id="base">
	<div class="account-view" v-if="loggedIn">
		<Row class="user">
			<Col span="5">
				<img :src="user.avatar || 'http://placehold.it/32x32'" class="avatar-small">
			</Col>
			<Col span="19">
				<span class="username">{{ user.username }}</span>
			</Col>
		</Row>

		<Icon type="thumbsup" size="20" color="#47dced" />
		<span class="likes">{{ user.likes | humanize }} Likes</span>

		<br>
		<Icon type="android-favorite" size="20" color="#ed4778" />
		<span class="favorites">{{ user.favorites | humanize }} Favorites</span>
	</div>
	<div class="account-view" v-if="hasToken && loggedIn === null">
		<div class="icon-text-wrapper user">
			<img src="http://placehold.it/32x32" class="avatar-small">
			<span class="username">Loading...</span>
		</div>
	</div>
	<div class="account-view" v-if="!hasToken || loggedIn === false">
		<Form>
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
	<div class="images-wrapper">
		<div class="page-wrapper">
			<Page class-name="page" :current="page" :page-size="1" :total="hitEnd ? images.length : images.length + 1" @on-change="changePage"></Page>
		</div>
		<div class="images">
			<transition-group name="slide-in">
				<div class="image-page" v-for="(im, i) of images" v-show="i === page - 1" v-if="Math.abs(i - (page - 1)) < 2" :key="i">
					<image-preview v-for="image of im" :image="image" :key="image.id"></image-preview>
				</div>
			</transition-group>
		</div>
		<div class="page-wrapper">
			<Page class-name="page" :current="page" :page-size="1" :total="hitEnd ? images.length : images.length + 1" @on-change="changePage"></Page>
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
			direction: 'right',
			hitEnd: false
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
		changePage(page) {
			if (page < this.age && page !== 1)
				this.direction = 'left';
			else if (page > this.page) {
				if (page < this.images.length)
					this.direction = 'right';
				else if (this.images.length !== 0 && this.images.length % 3 === 0 && this.images[this.images.length - 1].length % 9 === 0 && this.images.length === page) {
					this.getResults();
					this.direction = 'right';
				} else
					this.hitEnd = true
			}
			this.page = page;
		},
		async login() {
			let username = document.getElementsByName('login-user')[0].value,
				password = document.getElementsByName('login-pass')[0].value;

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

				if (response.data.images.length === 0)
					this.hitEnd = true;
				else {
					while (response.data.images.length > 0)
						this.images.push(response.data.images.splice(0, 9));

					if (this.images[this.images.length - 1].length !== 9)
						this.hitEnd = true;
				}

				return response;
			} catch(error) {
				console.error(error);
				this.$Modal.error({
					title: 'Error Requesting Image Data',
					content: error ? error.response && error.response.data.message || error.message : 'Unknown Error'
				});
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
		.likes
			color: #47dced
			font-size: 20px
			margin-left: 6px
		.favorites
			color: #ed4778
			font-size: 20px
			margin-left: 4.75px
	.images-wrapper
		max-width: 1024px
		flex-basis: 1024px
		margin-left: 1rem
		box-sizing: border-box
		.page-wrapper
			text-align: center
			.page
				display: inline-block
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
