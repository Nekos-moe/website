<template>
<div id="base">
	<div v-if="!profile">
		<!-- In the future, a loading spinner component goes here -->
	</div>
	<div class="profile" v-if="profile">
		<img :src="profile.avatar || 'http://placehold.it/256x256'" class="avatar-profile">
		<p class="username">{{ profile.username }}</p>
		<div class="icon-text-wrapper">
			<img src="http://placehold.it/20x20">
			<span class="likes">{{ profile.likes | humanize }} Likes</span>
			<img src="http://placehold.it/20x20">
			<span class="favorites">{{ profile.favorites | humanize }} Favorites</span>
		</div>
	</div>
	<div class="images-wrapper" v-if="profile">
		<div class="tabs">
			<button id="uploads" @click="changeTab" class="active-tab">Uploads</button>
			<button id="likes" @click="changeTab">Likes</button>
			<button id="favorites" @click="changeTab">Favorites</button>
		</div>
		<hr>
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
			direction: 'right',
			profile: null,
			mode: 'uploads'
		};
	},
	computed: {
		user() {
			return this.$store.state.user;
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
			} else if (this.images.length !== 0 && this.images.length % 3 === 0 && this.images[this.images.length - 1].length % 9 === 0 && this.images.length === this.page) {
				if (this.mode === 'uploads')
					this.getUploads();
				else
					this.getImages();
				this.direction = 'right';
				this.page++;
			}
		},
		async getUser() {
			try {
				if (!this.$route.params.id)
					return;

				let response = await this.$http.get(`${API_BASE_URL}user/${this.$route.params.id}`, {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				});

				this.profile = response.data.user;
				return;
			} catch(error) {
				console.error(error);
				this.$parent.$data.modalData = {
					title: 'Request Error',
					body: error.response && error.response.data.message || error.message,
					type: 'error'
				};
			}
		},
		async getImages() {
			try {
				if (!this.profile)
					return;

				let ids = this.mode === 'likes' ? this.profile.likes : this.profile.favorites;
				ids = ids.slice(9 * (this.page - 1), 9 * (this.page - 1) + 27);

				let response = await this.$http.post(API_BASE_URL + 'batch/images', { ids }, {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				});

				while (response.data.images.length > 0)
					this.images.push(response.data.images.splice(0, 9));

				return response;
			} catch(error) {
				console.error(error);
				this.$parent.$data.modalData = {
					title: 'Request Error',
					body: error.response && error.response.data.message || error.message,
					type: 'error'
				};
			}
		},
		async getUploads() {
			try {
				if (!this.profile)
					return;

				let response = await this.$http.post(API_BASE_URL + 'images/search', {
					sort: 'recent',
					limit: 27,
					skip: this.page !== 1 ? this.page * 9 : 0,
					uploader: {
						id: this.profile.id
					}
				}, {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				});

				while (response.data.images.length > 0)
					this.images.push(response.data.images.splice(0, 9));

				return response;
			} catch(error) {
				console.error(error);
				this.$parent.$data.modalData = {
					title: 'Request Error',
					body: error.response && error.response.data.message || error.message,
					type: 'error'
				};
			}
		},
		changeTab(e) {
			switch (e.target.id) {
				case 'uploads':
					this.mode = 'uploads';
					break;
				case 'likes':
					this.mode = 'likes';
					break;
				case 'favorties':
					this.mode = 'favorties';
					break;
			}

			document.getElementsByClassName('active-tab')[0].classList.remove('active-tab');
			e.target.classList.add('active-tab');
			this.page = 1;
			this.images = [];
			this.direction = 'right';

			if (this.mode === 'uploads')
				this.getUploads();
			else
				this.getImages();
		}
	},
	async mounted() {
		await this.getUser();
		if (this.mode === 'uploads')
			this.getUploads();
		else
			this.getImages();
	},
	watch: {
		async $route() {
			await this.getUser();
			if (this.mode === 'uploads')
				this.getUploads();
			else
				this.getImages();
		}
	}
}
</script>

<style lang="sass" scoped>
#base
	.profile
		margin: 1rem auto
		text-align: center
		font-family: 'Nunito', sans-serif
		hr
			border: none
			border-top: 1px solid #ECECEC

		.icon-text-wrapper
			margin: .5rem auto
			display: table
			margin-bottom: .5rem
			img
				vertical-align: middle
			span
				display: table-cell
				vertical-align: middle
				padding-left: .5rem
				&.likes
					color: #47dced
				&.favorites
					color: #ed4778
			span + img
				margin-left: 1rem
		.avatar-profile
			max-width: 256px
			max-height: 256px
			border-radius: 5%
		.username
			margin: 1rem
			font-size: 2rem
	.images-wrapper
		margin-top: 3rem
		.tabs
			text-align: center
			button
				display: inline-block
				margin: 0
				padding: 5px 10px 3px 10px
				border: 1px solid #666
				border-bottom: 1px solid #FFF
				border-radius: 6px 6px 0 0
				background-color: #FFF
				font-family: 'Nunito', sans-serif
				font-size: 1.2rem
				outline: none !important
				&:hover
					cursor: pointer
				&:not(.active-tab)
					border-bottom: 1px solid #666
		hr
			margin: 0 auto
			border: none
			border-top: 1px solid #666
			margin-top: -1px
			margin-bottom: 1rem
			z-index: -1
			max-width: 1000px
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
			margin: auto
			display: flex
			flex-wrap: wrap
			justify-content: space-around
			max-width: 1000px
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
