<template>
<div id="base-pending">
	<b-modal :active.sync="isDenyActive" has-modal-card>
		<div class="modal-card">
			<header class="modal-card-head">
				<p class="modal-card-title">Deny Post</p>
			</header>
			<section class="modal-card-body">
				<p>What is your reason for denying post {{ denyId }}?</p>
				<br>
				<b-field label="Reason">
					<b-input type="textarea" v-model="reason" required></b-input>
				</b-field>
			</section>
			<footer class="modal-card-foot">
				<button class="button" @click="isDenyActive = false">Cancel</button>
				<button class="button is-primary" @click="reason && deny(denyId, reason)">Deny</button>
			</footer>
		</div>
	</b-modal>
	<div class="post-grid-wrapper">
		<div class="pagination-wrapper top">
			<b-pagination
				:total="posts.length"
				:current.sync="page"
				order="is-centered"
				:per-page="1">
			</b-pagination>
		</div>
		<transition-group name="fade">
			<div class="page" v-for="(_page, i) of posts" :key="i" v-if="page === i + 1">
				<div class="columns is-multiline is-centered">
					<div class="column is-one-third" v-for="(post, i2) of _page" :key="i2">
						<div class="card" :id="'post-' + post.id">
							<div class="card-image">
								<figure class="image">
									<img :src="IMAGE_BASE_URL + post.id">
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

								<p v-show="currentlyEditing !== post.id">Artist: {{ post.artist || 'Unknown' }}</p>
								<div class="field" v-if="currentlyEditing === post.id">Artist: <b-input v-model="post.artist" size="is-small"></b-input></div>
								<div class="field" v-if="currentlyEditing === post.id"><b-switch v-model="post.nsfw" type="is-danger">Adult Content</b-switch></div>
								<b-tag
									v-for="(tag, i) of post.tags"
									:key="i"
									:type="post.nsfw ? 'is-danger' : 'is-primary'"
									:closable="currentlyEditing === post.id"
									@close="removeTag(post, tag)"
								>{{ tag }}</b-tag>
								<b-field v-if="currentlyEditing === post.id">
									<b-input v-model="newTag" size="is-small" expanded></b-input>
									<p class="control"><button class="button is-primary is-small" :class="{ 'is-danger': post.nsfw }" @click="addTag(post)">Add tag</button></p>
								</b-field>
							</div>
							<footer class="card-footer">
								<a v-show="currentlyEditing !== post.id" @click="confirmApprove(post.id)" class="card-footer-item has-text-success">Approve</a>
								<a @click="currentlyEditing === post.id ? saveChanges(post) : edit(post.id)" class="card-footer-item" :class="{ 'has-text-success': currentlyEditing === post.id }">{{ currentlyEditing === post.id ? 'Save changes' : 'Edit' }}</a>
								<a v-show="currentlyEditing === post.id" @click="discard(post, post.id)" class="card-footer-item has-text-danger">Discard changes</a>
								<a v-show="currentlyEditing !== post.id" @click="promptDeny(post.id)" class="card-footer-item has-text-danger">Deny</a>
							</footer>
						</div>
					</div>
				</div>
			</div>
		</transition-group>
		<div class="pagination-wrapper bottom">
			<b-pagination
				:total="posts.length"
				:current.sync="page"
				order="is-centered"
				:per-page="1">
			</b-pagination>
		</div>
	</div>
</div>
</template>

<script>
export default {
	data() {
		return {
			IMAGE_BASE_URL,
			posts: [],
			page: 1,
			currentlyEditing: null,
			newTag: '',
			isDenyActive: false,
			denyId: null,
			reason: ''
		};
	},
	computed: {
		user() {
			return this.$store.state.user;
		}
	},
	methods: {
		async getPosts() {
			this.$Progress.start();

			try {
				let response = await this.$http.get(API_BASE_URL + 'pending/list', {
					responseType: 'json',
					headers: { 'Authorization': localStorage.getItem('token') }
				});

				while (response.data.images.length > 0)
					this.posts.push(response.data.images.splice(0, 9));

				this.$Progress.finish();

				return response;
			} catch (error) {
				this.$Progress.fail();
				console.error(error);
				return this.$dialog.alert({
					type: 'is-danger',
					title: 'Error getting pending posts',
					message: error ? error.response && error.response.data.message || error.message : 'Unknown Error',
					hasIcon: true
				});
			}
		},
		async saveChanges(post) {
			if (!this.currentlyEditing)
				return null;

			this.$Progress.start();

			try {
				let resp = await this.$http.patch(API_BASE_URL + 'images/' + post.id, {
					tags: post.tags,
					artist: post.artist || '',
					nsfw: post.nsfw,
					pending: true
				}, {
					headers: { 'Authorization': localStorage.getItem('token') }
				});

				this.currentlyEditing = null;

				this.$Progress.finish();

				this.$snackbar.open({
					type: 'is-success',
					message: `Post ${post.id} edited`,
					duration: 3000,
					position: 'is-bottom-right'
				});

				return true;
			} catch (error) {
				this.$Progress.fail();
				console.error(error);
				this.$dialog.alert({
					type: 'is-danger',
					title: 'Error saving changes',
					message: error ? error.response && error.response.data.message || error.message : 'Unknown Error',
					hasIcon: true
				});
				return false;
			}
		},
		confirmApprove(id) {
			this.$dialog.confirm({
				title: 'Approve Post',
				message: `Are you sure you want to approve post ${id}?`,
				confirmText: 'Approve',
				onConfirm: () => this.approve(id)
			});
		},
		async approve(id) {
			this.$Progress.start();

			try {
				let response = await this.$http.post(`${API_BASE_URL}pending/${id}/review`, {
					action: 'approve'
				}, {
					headers: { 'Authorization': localStorage.getItem('token') }
				});

				this.$Progress.finish();

				this.removePost(id);

				this.$snackbar.open({
					type: 'is-success',
					message: `Post ${id} approved`,
					duration: 5000,
					position: 'is-bottom-right'
				});

				return response;
			} catch (error) {
				this.$Progress.fail();
				console.error(error);
				return this.$dialog.alert({
					type: 'is-danger',
					title: 'Error approving post ' + id,
					message: error ? error.response && error.response.data.message || error.message : 'Unknown Error',
					hasIcon: true
				});
			}
		},
		promptDeny(id) {
			this.denyId = id;
			this.isDenyActive = true;
		},
		async deny(id, reason) {
			this.isDenyActive = false;
			this.denyId = null;

			this.$Progress.start();

			try {
				let response = await this.$http.post(`${API_BASE_URL}pending/${id}/review`, {
					action: 'deny',
					reason
				}, {
					headers: { 'Authorization': localStorage.getItem('token') }
				});

				this.$Progress.finish();

				this.removePost(id);

				this.$snackbar.open({
					type: 'is-success',
					message: `Post ${id} denied`,
					duration: 5000,
					position: 'is-bottom-right'
				});

				return response;
			} catch (error) {
				this.$Progress.fail();
				console.error(error);
				return this.$dialog.alert({
					type: 'is-danger',
					title: 'Error denying post ' + id,
					message: error ? error.response && error.response.data.message || error.message : 'Unknown Error',
					hasIcon: true
				});
			}
		},
		edit(id) {
			if (this.currentlyEditing)
				return this.$dialog.confirm({
					title: 'You are already editing a post',
					message: 'Do you want to save your changes?',
					confirmText: 'Save changes',
					type: 'is-warning',
					onConfirm: async () => {
						let success = await this.saveChanges();
						if (success)
							this.currentlyEditing = id;
					}
				})

			this.currentlyEditing = id;
		},
		removeTag(post, tag) {
			if (!this.currentlyEditing)
				return null;

			return this.$delete(post.tags, post.tags.indexOf(tag));
		},
		async discard(post, id) {
			try {
				let response = await this.$http.get(`${API_BASE_URL}images/${id}`, { headers: { 'Authorization': localStorage.getItem('token') } });

				post.tags = response.data.image.tags;
				post.artist = response.data.image.artist;
				post.nsfw = response.data.image.nsfw;
			} catch(error) {
				console.error(error);
				return this.$dialog.alert({
					type: 'is-danger',
					title: 'Error getting post data',
					message: error ? error.response && error.response.data.message || error.message : 'Unknown Error',
					hasIcon: true
				});
			}

			this.currentlyEditing = null;
		},
		addTag(post) {
			if (!this.currentlyEditing || !this.newTag)
				return

			this.$set(post.tags, post.tags.length, this.newTag);
			this.newTag = '';
		},
		removePost(id) {
			if (!id)
				return;

			let found = false;
			this.posts.forEach((page, i) => {
				if (!found) {
					let index = page.findIndex(p => p.id === id)
					if (index >= 0) {
						found = true;
						this.posts[i].splice(index, 1);
						if (this.posts.length > i + 1) {
							this.posts[i].push(this.posts[i + 1].shift());
							if (this.posts[i + 1].length === 0)
								this.posts.splice(i + 1, 1);
						}
						return;
					}
					return;
				}

				if (this.posts.length > i + 1) {
					this.posts[i].splice(page.length - 1, 1, this.posts[i + 1].shift());
					if (this.posts[i + 1].length === 0)
						this.posts.splice(i + 1, 1);
					return;
				}
				return;
			});
		}
	},
	beforeMount() {
		this.getPosts();
	}
}
</script>

<style lang="sass">
#base-pending
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
