<template>
	<div class="post-card-component card">
		<div class="card-image">
			<figure class="image">
				<img :src="THUMBNAIL_BASE_URL + post.id" @click="imageModal">
			</figure>
		</div>
		<div class="card-content">
			<div class="media">
				<div class="media-left">
					<figure class="image is-48x48">
						<img class="avatar" :src="require('@/../static/images/404.jpg')">
						<!-- When avatars are in, input the uploader id into the avatar path and the server will handle 404s -->
					</figure>
				</div>
				<div class="media-content">
					<p class="title is-5"><router-link :to="'/user/' + post.uploader.id" :class="{ 'has-text-danger': post.nsfw }">{{ post.uploader.username }}</router-link></p>
					<p class="subtitle is-6">{{ new Date(post.createdAt).toLocaleString() }}</p>
				</div>
			</div>

			<p>Artist: {{ post.artist || 'Unknown' }}</p>
			<b-tag v-for="(tag, i) of tagsPreview" :key="i" :type="post.nsfw ? 'is-danger' : 'is-primary'">{{ tag }}</b-tag><!--
			--><b-tag v-if="post.tags.length > 12" class="tag-more" :type="post.nsfw ? 'is-danger' : 'is-primary'">+ {{post.tags.length - 12}} more</b-tag>
		</div>
		<footer class="card-footer">
			<router-link class="card-footer-item" :to="'/post/' + post.id">View</router-link>
			<a v-if="loggedIn" @click="like" class="card-footer-item has-text-success">{{ user.likes.includes(post.id) ? 'Unlike' : 'Like' }}</a>
			<a v-if="loggedIn" @click="like('favorites')" class="card-footer-item has-text-danger">{{ user.favorites.includes(post.id) ? 'Unfavorite' : 'Favorite' }}</a>
		</footer>
	</div>
</template>

<script>
export default {
	data() {
		return {
			THUMBNAIL_BASE_URL
		};
	},
	props: {
		post: Object,
	},
	computed: {
		user() {
			return this.$store.state.user;
		},
		loggedIn() {
			return this.$store.state.loggedIn;
		},
		tagsPreview() {
			return this.post.tags.length !== 0 ? this.post.tags.sort((a, b) => a.localeCompare(b)).slice(0, 12) : this.post.tags;
		}
	},
	methods: {
		async like(type = 'likes') {
			try {
				await this.$http.patch(`${API_BASE_URL}image/${this.post.id}/relationship`, {
					type: type.slice(0, -1),
					create: !this.user[type].includes(this.post.id)
				}, { headers: { 'Authorization': localStorage.getItem('token') } });

				if (this.user[type].includes(this.post.id))
					this.user[type].splice(this.user[type].indexOf(this.post.id), 1);
				else
					this.user[type].push(this.post.id);
			} catch (error) {
				console.error(error);
				return this.$dialog.alert({
					type: 'is-danger',
					title: 'Error updating image relationship',
					message: error ? error.response && error.response.data.message || error.message : 'Unknown Error',
					hasIcon: true
				});
			}
		},
		imageModal() {
			return this.$modal.open(
				`<div class="image">
					<img class="modal-image" src="${IMAGE_BASE_URL}${this.post.id}">
				</div>`
			)
		}
	}
}
</script>

<style lang="sass">
.post-card-component
	.card-image
		img
			max-height: 420px
			width: auto
			margin: 0 auto
			&:hover
				cursor: pointer
	.card-content
		padding: 1rem
		.avatar
			border-radius: 2px
		.tag
			margin: 2px
			& + div.field
				margin-top: 12px
	footer
		margin: 0
		font-weight: bold
</style>
