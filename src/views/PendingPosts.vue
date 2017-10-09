<template>
<div id="base-pending">
	<div class="post-grid-wrapper">
		<div class="page" v-for="(page, i) of posts" :key="i"><!-- add v-if -->
			<div class="columns is-centered" v-for="(row, i2) of page" :key="i2">
				<div class="column is-one-third" v-for="(post, i3) of row" :key="i3">
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

							<p v-show="currentlyEditing !== post.id">Artist: {{ post.artist || 'Unknown' }}</p>
							<div class="field" v-if="currentlyEditing === post.id">Artist: <b-input v-model="post.artist" :value="post.artist || ''" size="is-small"></b-input></div>
							<div class="field" v-if="currentlyEditing === post.id"><b-switch :value="post.nsfw" v-model="post.nsfw" type="is-danger">Adult Content</b-switch></div>
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
							<a v-show="currentlyEditing !== post.id" @click="approve(post.id)" class="card-footer-item has-text-success">Approve</a>
							<a @click="currentlyEditing === post.id ? saveChanges() : edit(post.id)" class="card-footer-item" :class="{ 'has-text-success': currentlyEditing === post.id }">{{ currentlyEditing === post.id ? 'Save changes' : 'Edit' }}</a>
							<a v-show="currentlyEditing === post.id" @click="discard(post.id)" class="card-footer-item has-text-danger">Discard changes</a>
							<a v-show="currentlyEditing !== post.id" @click="deny(post.id)" class="card-footer-item has-text-danger">Deny</a>
						</footer>
					</div>
				</div>
			</div>
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
			currentlyEditing: null,
			newTag: ''
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

				while (response.data.images.length > 0) {
					let page = [];
					while (page.length < 3 && response.data.images.length > 0)
						page.push(response.data.images.splice(0, 3))

					this.posts.push(page);
				}

				this.$Progress.finish();

				return response;
			} catch (error) {
				this.$Progress.fail();
				console.error(error);
				return this.$Modal.error({
					title: 'Error Getting Pending Posts',
					content: error ? error.response && error.response.data.message || error.message : 'Unknown Error'
				});
			}
		},
		async saveChanges() {
			if (!this.currentlyEditing)
				return null;

			try {
				let post = null;
				this.posts.find(p => p.find(r => r.find(i => {
					if (i.id === this.currentlyEditing) {
						post = i;
						return true;
					}
					return false;
				})));

				let resp = await this.$http.patch(API_BASE_URL + 'images/' + this.currentlyEditing, {
					tags: post.tags,
					artist: post.artist,
					nsfw: post.nsfw,
					pending: true
				}, {
					headers: { 'Authorization': localStorage.getItem('token') }
				});

				this.currentlyEditing = null;

				return true;
			} catch (error) {
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
		approve(id) {
			console.log(id);
		},
		deny(id) {
			console.log(id);
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

			this.$delete(post.tags, post.tags.indexOf(tag));
		},
		async discard(id) {
			try {
				let response = await this.$http.get(`${API_BASE_URL}images/${id}`, { headers: { 'Authorization': localStorage.getItem('token') } });

				let post = null;
				this.posts.find(p => p.find(r => r.find(i => {
					if (i.id === this.currentlyEditing) {
						post = i;
						return true;
					}
					return false;
				})));

				post.tags = response.data.image.tags;
				post.artist = response.data.image.artist;
				post.nsfw = response.data.image.nsfw;
			} catch(error) {
				console.error(error);
				this.$Modal.error({
					title: 'Error Requesting Image Data',
					content: error ? error.response && error.response.data.message || error.message : 'Unknown Error'
				});
			}

			this.currentlyEditing = null;
		},
		addTag(post) {
			if (!this.currentlyEditing || !this.newTag)
				return

			this.$set(post.tags, post.tags.length, this.newTag);
			this.newTag = '';
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
		.page
			.columns
				.column
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

</style>
