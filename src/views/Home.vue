<template>
<div id="base-home">
	<!-- <div class="attention" v-if="loggedIn && !seenNotice('approval')">
		<b-message title="Site Changes" type="is-info" has-icon @close="ackNotice('approval')">All posts now require approval before they appear on the home page and in searches. Ensure that your posts follow the uploading guidelines when you submit them!</b-message>
	</div> -->
	<div class="post-grid-wrapper">
		<div class="pagination-wrapper top">
			<b-pagination
				:total="hitEnd ? posts.length : posts.length + 1"
				:current="page"
				order="is-centered"
				:per-page="1"
				@change="changePage">
			</b-pagination>
		</div>
		<transition-group name="fade">
			<div class="page" v-for="(_page, i) of posts" :key="i" v-if="page === i + 1">
				<div class="columns is-multiline is-centered">
					<div class="column is-one-third" v-for="(post, i2) of _page" :key="i2">
						<post-card :post="post" />
					</div>
				</div>
			</div>
		</transition-group>
		<div class="pagination-wrapper bottom">
			<b-pagination
				:total="hitEnd ? posts.length : posts.length + 1"
				:current="page"
				order="is-centered"
				:per-page="1"
				@change="changePage">
			</b-pagination>
		</div>
	</div>
</div>
</template>

<script>
import PostCard from '@/components/PostCard';

export default {
	data() {
		return {
			THUMBNAIL_BASE_URL,
			posts: [],
			page: 1,
			hitEnd: false
		};
	},
	components: {
		PostCard
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
		async changePage(page) {
			if (page > this.page) {
				if (this.posts.length !== 0 && this.posts.length % 3 === 0 && this.posts[this.posts.length - 1].length % 9 === 0 && this.posts.length <= page)
					await this.getImages();
				else if (page >= this.posts.length)
					this.hitEnd = true
			}
			this.page = page;
		},
		async getImages() {
			try {
				let response = await this.$http.post(API_BASE_URL + 'images/search', {
					sort: 'recent',
					limit: 27,
					skip: this.posts.length * 9,
					nsfw: this.$store.getters.NSFWImages === false ? false : undefined,
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
						this.posts.push(response.data.images.splice(0, 9));

					if (this.posts[this.posts.length - 1].length !== 9)
						this.hitEnd = true;
				}

				return response;
			} catch (error) {
				console.error(error);
				return this.$dialog.alert({
					type: 'is-danger',
					title: 'Error getting posts',
					message: error ? error.response && error.response.data.message || error.message : 'Unknown Error',
					hasIcon: true
				});
			}
		},
		seenNotice(name) {
			return localStorage.getItem('lastNotice') === name;
		},
		ackNotice(name) {
			return localStorage.setItem('lastNotice', name);
		}
	},
	beforeMount() {
		this.getImages();
	}
}
</script>

<style lang="sass">
#base-home
	margin: 30px 0
	.attention
		margin-bottom: 30px
		.message
			max-width: 800px
			margin: auto
	.post-grid-wrapper
		.pagination-wrapper
			margin: auto
			max-width: 390px
			&.top
				margin: 16px auto
			&.bottom
				margin-top: 16px
		.page .columns .column
			margin: auto 0

	.fade-enter-active, .fade-leave-active
		transition: opacity .2s ease-in-out both
	.fade-enter, .fade-leave-to
		opacity: 0

	// IDK why this works, but if you remove it then changing page brings you back to the top
	.fade-enter-active + .page, .page + .fade-enter-active
	 	display: none
</style>
