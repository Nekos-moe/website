<template>
<div id="base-profile">
	<b-loading :active="!profile" :canCancel="true"></b-loading>
	<div class="profile-details" v-if="profile">
		<img :src="profile.avatar || require('@/../assets/images/404.jpg')" class="avatar-profile">
		<p class="username">{{ profile.username }}
			<b-tag v-for="role of profile.roles" :key="role" type="is-info" :closable="canEditRoles" @close="revokeRole(role)">{{ role | deCamelCase }}</b-tag>
			<button class="button is-success is-small" v-if="canEditRoles" @click="promptGrantRole">Add role</button>
		</p>
		<div class="likes">
			<b-icon icon="thumb-up"></b-icon>
			<span>{{ profile.likesReceived | humanize }} Like{{ profile.likesReceived === 1 ? '' : 's' }}</span>
		</div>
		<div class="favorites">
			<b-icon icon="heart"></b-icon>
			<span>{{ profile.favoritesReceived | humanize }} Favorite{{ profile.favoritesReceived === 1 ? '' : 's' }}</span>
		</div>
		<div class="stats">
			<p>Joined <timeago :since="profile.createdAt"></timeago></p>
			<p>Posted {{ profile.uploads | humanize }} images</p>
			<p>Has given {{ profile.likes.length | humanize }} like{{ profile.likes.length === 1 ? '' : 's' }} and {{ profile.favorites.length | humanize }} favorite{{ profile.favorites.length === 1 ? '' : 's' }}</p>
		</div>
	</div>
	<div class="post-grid-wrapper">
		<b-tabs class="post-tabs" type="is-boxed" position="is-centered" @change="changeTab">
			<b-tab-item label="Posts" icon="format-list-bulleted"></b-tab-item>
			<b-tab-item label="Likes" icon="thumb-up"></b-tab-item>
			<b-tab-item label="Favorites" icon="heart"></b-tab-item>
		</b-tabs>
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
									<img :src="THUMBNAIL_BASE_URL + post.id" @click="imageModal(post.id)">
								</figure>
							</div>
							<div class="card-content">
								<p>Posted: {{ new Date(post.createdAt).toLocaleString() }}</p>
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
			profile: null,
			mode: 'uploads',
			hitEnd: false
		};
	},
	computed: {
		user() {
			return this.$store.state.user;
		},
		canEditRoles() {
			return this.user && this.user.roles && this.user.roles.includes('admin')
		},
		loggedIn() {
			return this.$store.state.loggedIn;
		}
	},
	methods: {
		async changePage(page) {
			if (page > this.page) {
				if (this.posts.length !== 0 && this.posts.length % 3 === 0 && this.posts[this.posts.length - 1].length % 9 === 0 && this.posts.length <= page) {
					if (this.mode === 'uploads')
						await this.getUploads();
					else
						await this.getImages();
				} else if (page >= this.posts.length)
					this.hitEnd = true
			}
			this.page = page;
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
				return this.$dialog.alert({
					type: 'is-danger',
					title: 'Error getting user data',
					message: error ? error.response && error.response.data.message || error.message : 'Unknown Error',
					hasIcon: true
				});
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

				if (response.data.images.length === 0)
					this.hitEnd = true;
				else {
					while (response.data.images.length > 0)
						this.posts.push(response.data.images.splice(0, 9));

					if (this.posts[this.posts.length - 1].length !== 9)
						this.hitEnd = true;
				}

				return response;
			} catch(error) {
				console.error(error);
				return this.$dialog.alert({
					type: 'is-danger',
					title: 'Error getting image data',
					message: error ? error.response && error.response.data.message || error.message : 'Unknown Error',
					hasIcon: true
				});
			}
		},
		async getUploads() {
			try {
				if (!this.profile)
					return;

				let response = await this.$http.post(API_BASE_URL + 'images/search', {
					sort: 'recent',
					limit: 27,
					skip: this.page !== 1 ? (this.page + 1) * 9 : 0,
					uploader: {
						id: this.profile.id
					}
				}, {
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
			} catch(error) {
				console.error(error);
				return this.$dialog.alert({
					type: 'is-danger',
					title: 'Error getting user uploads',
					message: error ? error.response && error.response.data.message || error.message : 'Unknown Error',
					hasIcon: true
				});
			}
		},
		changeTab(position) {
			switch (position) {
				case 0:
					this.mode = 'uploads';
					break;
				case 1:
					this.mode = 'likes';
					break;
				case 2:
					this.mode = 'favorites';
					break;
			}

			this.page = 1;
			this.posts = [];
			this.hitEnd = false;

			if (this.mode === 'uploads')
				this.getUploads();
			else
				this.getImages();
		},
		imageModal(id) {
			return this.$modal.open(
				`<div class="image">
					<img class="modal-image" src="${IMAGE_BASE_URL}${id}">
				</div>`
			)
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
		},
		async revokeRole(role) {
			try {
				let resp = await this.$http.patch(`${API_BASE_URL}user/${this.profile.id}/roles`, {
					role,
					action: 'revoke'
				}, { headers: { 'Authorization': localStorage.getItem('token') } });

				this.$parent.$delete(this.profile.roles, this.profile.roles.indexOf(role));

				return his.$snackbar.open({
					type: 'is-success',
					message: `Role ${role} revoked from ${this.profile.username}`,
					duration: 5000,
					position: 'is-bottom-right'
				});
			} catch (error) {
				console.error(error);
				return this.$dialog.alert({
					type: 'is-danger',
					title: 'Error revoking role',
					message: error ? error.response && error.response.data.message || error.message : 'Unknown Error',
					hasIcon: true
				});
			}

		},
		promptGrantRole() {
			return this.$dialog.prompt({
				title: 'Add role',
				message: `What role do you want to add to ${this.profile.username}?`,
				inputAttrs: { },
				confirmText: 'Add',
				onConfirm: role => this.grantRole(role)
			});
		},
		async grantRole(role) {
			try {
				let resp = await this.$http.patch(`${API_BASE_URL}user/${this.profile.id}/roles`, {
					role,
					action: 'grant'
				}, { headers: { 'Authorization': localStorage.getItem('token') } });

				this.profile.roles.push(role);

				return his.$snackbar.open({
					type: 'is-success',
					message: `Role ${role} given to ${this.profile.username}`,
					duration: 5000,
					position: 'is-bottom-right'
				});
			} catch (error) {
				console.error(error);
				return this.$dialog.alert({
					type: 'is-danger',
					title: 'Error granting role',
					message: error ? error.response && error.response.data.message || error.message : 'Unknown Error',
					hasIcon: true
				});
			}
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

<style lang="sass">
#base-profile
	.profile-details
		margin: 0 auto 40px
		max-width: 600px
		display: grid
		grid-template-columns: 50% 50%
		grid-template-rows: 256px 60px 40px 40px
		grid-gap: 5px 10px
		align-items: center
		justify-items: center
		.likes, .favorites
			grid-column: 1
			font-size: 24px
			.icon
				margin-right: 6px
		.likes
			grid-row: 3
			color: #209cee
		.favorites
			grid-row: 4
			color: #ff3860
		.avatar-profile
			grid-column: 1 / span 2
			grid-row: 1
			max-width: 256px
			max-height: 256px
			border-radius: 5px
		.username
			grid-column: 1 / span 2
			grid-row: 2
			font-family: 'Nunito', sans-serif
			font-size: 36px
			line-height: 60px
			.tag
				position: relative
				margin-left: 10px
				height: 27px
				border-radius: 2px
				top: -3px
				vertical-align: middle
			.button
				top: -3px
				vertical-align: middle
		.stats
			grid-column: 2
			grid-row: 3 / span 2
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
	.fade-enter-active + .page, .page + .fade-enter-active
		display: none

</style>
