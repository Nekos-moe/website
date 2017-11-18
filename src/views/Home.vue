<template>
<div id="base-home">
	<div class="account-view" v-if="loggedIn">
		<div class="user">
			<router-link :to="'/user/' + user.id">
				<img :src="user.avatar || require('@/../assets/images/404.jpg')" class="avatar-small">
				<span class="username">{{ user.username }}</span>
			</router-link>
		</div>

		<div class="user-stats">
			<Icon type="thumbsup" size="20" color="#47dced" />
			<span class="likes">{{ user.likesReceived | humanize }} Like{{ user.likesReceived !== 1 ? 's' : '' }}</span>
			<br />
			<Icon type="android-favorite" size="20" color="#ed4778" />
			<span class="favorites">{{ user.favoritesReceived | humanize }} Favorite{{ user.favoritesReceived !== 1 ? 's' : '' }}</span>
		</div>
	</div>
	<div class="account-view" v-if="hasToken && loggedIn === null">
		<div class="user">
			<span class="username">Loading...</span>
		</div>
	</div>

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
						<div class="card" :id="'post-' + post.id">
							<div class="card-image">
								<figure class="image">
									<img :src="THUMBNAIL_BASE_URL + post.id">
								</figure>
							</div>
							<div class="card-content">
								<div class="media">
									<div class="media-left">
										<figure class="image is-48x48">
											<img class="avatar" :src="user.avatar || require('@/../assets/images/404.jpg')">
										</figure>
									</div>
									<div class="media-content">
										<p class="title is-5"><router-link :to="'/user/' + post.uploader.id" :class="{ 'has-text-danger': post.nsfw }">{{ post.uploader.username }}</router-link></p>
										<p class="subtitle is-6">{{ new Date(post.createdAt).toLocaleString() }}</p>
									</div>
								</div>

								<p>Artist: {{ post.artist || 'Unknown' }}</p>
								<b-tag v-for="(tag, i) of post.tags.slice(0, 12)" :key="i" :type="post.nsfw ? 'is-danger' : 'is-primary'">{{ tag }}</b-tag>
									<b-tag v-if="post.tags.length > 12" class="tag-more" :type="post.nsfw ? 'is-danger' : 'is-primary'">+ {{post.tags.length - 12}} more</b-tag>
							</div>
							<footer class="card-footer">
								<router-link class="card-footer-item" :to="'/post/' + post.id">View</router-link>
								<a v-if="loggedIn" @click="like(post.id)" class="card-footer-item has-text-success">{{ user.likes.includes(post.id) ? 'Unlike' : 'Like' }}</a>
								<a v-if="loggedIn" @click="like(post.id, 'favorites')" class="card-footer-item has-text-danger">{{ user.favorites.includes(post.id) ? 'Unfavorite' : 'Favorite' }}</a>
							</footer>
						</div>
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
export default {
	data() {
		return {
			THUMBNAIL_BASE_URL,
			posts: [],
			page: 1,
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
					skip: this.page !== 1 ? (this.page + 1) * 9 : 0,
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
		async like(id, type = 'likes') {
			try {
				await this.$http.patch(`${API_BASE_URL}image/${id}/relationship`, {
					type: type.slice(0, -1),
					create: !this.user[type].includes(id)
				}, { headers: { 'Authorization': localStorage.getItem('token') } });

				if (this.user[type].includes(id))
					this.user[type].splice(this.user[type].indexOf(id), 1);
				else
					this.user[type].push(id);
			} catch (error) {
				console.error(error);
				return this.$dialog.alert({
					type: 'is-danger',
					title: 'Error updating image relationship',
					message: error ? error.response && error.response.data.message || error.message : 'Unknown Error',
					hasIcon: true
				});
			}
		}
	},
	beforeMount() {
		this.getImages();
	}
}
</script>

<style lang="sass">
#base-home
	.account-view
		box-sizing: border-box
		box-shadow: 0 0 3px #CCC
		border-radius: .25rem
		font-family: 'Nunito', sans-serif
		display: flex
		justify-content: flex-start
		.user
			padding: 1rem
			border-right: 1px solid #ececec
			a
				display: block
			.avatar-small
				width: 54px
				height: 54px
				vertical-align: top
				border-radius: .25rem
				margin-right: 1rem
			.username
				font-size: 2em
				line-height: 54px
				color: #333942 !important

		.user-stats
			padding: 1rem
			max-height: 86px
			.likes
				color: #47dced
				font-size: 20px
				margin-left: 6px
			.favorites
				color: #ed4778
				font-size: 20px
				margin-left: 4.75px

	.post-grid-wrapper
		.pagination-wrapper
			margin: auto
			max-width: 390px
			&.top
				margin: 16px auto
			&.bottom
				margin-top: 16px
		.page
			.columns
				.column
					margin: auto 0
					.card-image
						img
							max-height: 420px
							width: auto
							margin: 0 auto
					.card-content
						padding: 1rem
						.avatar
							border-radius: 2px
						.tag
							margin: 2px
							& + div.field
								margin-top: 12px
						.tag-more
							margin-left: -2px
					footer
						margin: 0
						font-weight: bold

	.fade-enter-active, .fade-leave-active
		transition: opacity .2s ease-in-out both
	.fade-enter, .fade-leave-to
		opacity: 0

	// IDK why this works, but if you remove it then changing page brings you back to the top
	fade-enter-active + .page, .page + .fade-enter-active
	 	display: none
</style>
