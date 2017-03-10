<template>
<div id="base">
	<div class="post-info" v-if="image">
		<p>
			Uploaded by <router-link :to="'/user/' + image.uploader.id">{{ image.uploader.username }}</router-link><br>
			on {{ new Date(image.createdAt).toLocaleString() }}
		</p>
		<p>
			<strong>Favorites:</strong> {{ image.favorites | humanize }}<br>
			<strong>Likes:</strong> {{ image.likes | humanize }}
		</p>
		<p v-if="image.artist"><strong>Artist:</strong> {{ image.artist }}</p>
		<span class="tag" v-for="tag of image.tags.split(',')">{{ tag }}</span>
	</div>
	<div class="image-wrapper" v-if="image">
		<img :src="IMAGE_BASE_URL + image.id">
	</div>
	<!-- <div class="comments"></div> -->
</div>
</template>

<script>
export default {
	data() {
		return {
			IMAGE_BASE_URL,
			image: null
		};
	},
	computed: {
		user() {
			return this.$store.state.user;
		}
	},
	methods: {
		async updateData() {
			try {
				let response = await this.$http.get(`${API_BASE_URL}images/${this.$route.params.id}`, {
					responseType: 'json',
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				});

				this.image = response.data.image;
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
		this.updateData();
	},
	watch: {
		'$route': 'updateData'
	}
}
</script>

<style lang="sass" scoped>
#base
	display: flex
	.post-info
		flex-basis: 25%
		min-width: 250px
		.tag
			display: block
	.image-wrapper
		flex-basis: 65%
		display: flex
		justify-content: center
		align-items: flex-start
		img
			max-width: 100%
			max-height: 100%

</style>
