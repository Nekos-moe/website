<template>
<div id="base-post">
	<div class="columns">
		<div class="column is-one-quarter info" v-if="image">
			<div v-if="loggedIn && !image.pending && image.likes !== undefined" class="relationship-buttons">
				<button class="button is-info" :class="{ 'is-outlined': !user.likes.includes(image.id) }" @click="like"><b-icon icon="thumb-up"></b-icon>Like</button>
				<button class="button is-danger" :class="{ 'is-outlined': !user.favorites.includes(image.id) }" @click="favorite"><b-icon icon="heart"></b-icon>Favorite</button>
			</div>
			<b-message v-if="image.pending" title="Pending Approval" type="is-warning" :closable="false">This image is still pending approval and is unlisted.</b-message>
			<p class="block"><strong>Uploaded by</strong> <router-link :to="'/user/' + image.uploader.id">{{ image.uploader.username }}</router-link><br>on {{ new Date(image.createdAt).toLocaleString() }}</p>
			<p class="block" v-if="image.approver"><strong>Approved by</strong> <router-link :to="'/user/' + image.approver.id">{{ image.approver.username }}</router-link></p>
			<p class="block">
				<strong>Favorites:</strong> {{ image.favorites | humanize }}<br>
				<strong>Likes:</strong> {{ image.likes | humanize }}
			</p>
			<div class="field" v-if="editMode">
				<b-switch v-model="edits.nsfw" type="is-danger">Adult Content</b-switch>
			</div>
			<p v-if="image.artist && !editMode"><strong>Artist:</strong> {{ image.artist }}</p>
			<b-field v-if="editMode" label="Artist">
				<b-input v-model="edits.artist" icon="brush"></b-input>
			</b-field>
			<div class="tag-list" v-if="tags && tags.length > 0 && tags[0]">
				<b-tag v-for="(tag, i) of tags"
					:key="i"
					:type="(editMode ? edits.nsfw : image.nsfw) ? 'is-danger' : 'is-primary'"
					:closable="editMode"
					@close="deleteTag(tag)">{{ tag }}
				</b-tag>
			</div>
			<p class="block" v-else>No tags</p>
			<b-field v-if="editMode">
				<b-input v-model="newTag" placeholder="paw pose" expanded></b-input>
				<p class="control">
					<button class="button" @click="addTag">Add tag</button>
				</p>
			</b-field>
			<div class="edit-buttons" v-if="canEdit">
				<button v-show="!editMode" class="button is-info" @click="enableEditMode"><b-icon icon="pencil"></b-icon>Edit Post</button>
				<button v-show="!editMode" class="button is-danger" @click="confirmDelete"><b-icon icon="delete"></b-icon>Delete Post</button>
				<button v-show="editMode" class="button is-success" @click="saveChanges"><b-icon icon="content-save"></b-icon>Save</button>
				<button v-show="editMode" class="button is-warning" @click="updateData"><b-icon icon="close"></b-icon>Discard</button>
			</div>
		</div>
		<div class="column image-wrapper" v-if="image">
			<img :src="IMAGE_BASE_URL + image.id">
		</div>
	</div>
</div>
</template>

<script>
export default {
	data() {
		return {
			IMAGE_BASE_URL,
			image: null,
			tags: [],
			editMode: false,
			edits: {
				nsfw: false,
				artist: null,
				needsSync: false
			},
			likeLoading: false,
			favoriteLoading: false,
			newTag: ''
		};
	},
	computed: {
		user() {
			return this.$store.state.user;
		},
		canEdit() {
			return this.image && this.loggedIn && (this.user.roles.includes('admin') || this.user.roles.includes('editPosts') || this.image.uploader.id === this.user.id);
		},
		loggedIn() {
			return this.$store.state.loggedIn;
		}
	},
	methods: {
		enableEditMode() {
			if (this.edits.needsSync) {
				this.edits.nsfw = this.image.nsfw;
				this.edits.artist = this.image.artist;
				this.edits.needsSync = false;
			}

			this.editMode = true;
		},
		async updateData() {
			try {
				let response = await this.$http.get(`${API_BASE_URL}images/${this.$route.params.id}`, {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				});

				this.image = response.data.image;
				this.tags = response.data.image.tags;
				this.edits.artist = response.data.image.artist;
				this.edits.nsfw = response.data.image.nsfw;
				this.edits.needsSync = true;
				this.editMode = false;
			} catch(error) {
				console.error(error);
				this.$dialog.alert({
					type: 'is-danger',
					title: 'Error Requesting Image Data',
					message: error ? error.response && error.response.data.message || error.message : 'Unknown Error',
					hasIcon: true
				});
			}
		},
		saveChanges() {
			this.$http.patch(`${API_BASE_URL}images/${this.image.id}`, {
				tags: this.tags.join(','),
				artist: this.edits.artist,
				nsfw: this.edits.nsfw,
				pending: !!this.image.pending
			}, {
				headers: {
					'Authorization': localStorage.getItem('token')
				}
			}).then(() => this.updateData()).catch(error => {
				console.error(error);
				this.$dialog.alert({
					type: 'is-danger',
					title: 'Error Editing Post',
					message: error ? error.response && error.response.data.message || error.message : 'Unknown Error',
					hasIcon: true
				});
			});
		},
		confirmDelete() {
			return this.$dialog.confirm({
				type: 'is-danger',
				title: 'Delete Post',
				message: 'Are you sure you want to delete this post? This action cannot be undone.',
				confirmText: 'Delete',
				onConfirm: () => this.deletePost(),
				hasIcon: true
			});
		},
		async deletePost() {
			try {
				await this.$http.delete(`${API_BASE_URL}images/${this.image.id}`, {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				});

				this.$router.push('/');
			} catch(error) {
				console.error(error);
				this.$dialog.alert({
					type: 'is-danger',
					title: 'Error Deleting Image',
					message: error ? error.response && error.response.data.message || error.message : 'Unknown Error',
					hasIcon: true
				});
			}
		},
		deleteTag(name) {
			this.$parent.$delete(this.tags, this.tags.indexOf(name));
		},
		addTag() {
			if (this.newTag) {
				this.tags.push(this.newTag);
				this.newTag = '';
			}
		},
		async like(e) {
			if (this.likeLoading)
				return;

			this.likeLoading = true;

			e.target.blur();

			try {
				await this.$http.patch(`${API_BASE_URL}image/${this.image.id}/relationship`, {
					type: 'like',
					create: !this.user.likes.includes(this.image.id)
				}, { headers: { 'Authorization': localStorage.getItem('token') } });

				if (this.user.likes.includes(this.image.id))
					this.user.likes.splice(this.user.likes.indexOf(this.image.id), 1);
				else
					this.user.likes.push(this.image.id);

				this.likeLoading = false;
			} catch(error) {
				console.error(error);
				this.$dialog.alert({
					type: 'is-danger',
					title: 'Error Updating Image Relationship',
					message: error ? error.response && error.response.data.message || error.message : 'Unknown Error',
					hasIcon: true
				});
				this.likeLoading = false;
			}
		},
		async favorite(e) {
			if (this.favoriteLoading)
				return;

			this.favoriteLoading = true;

			e.target.blur();

			try {
				await this.$http.patch(`${API_BASE_URL}image/${this.image.id}/relationship`, {
					type: 'favorite',
					create: !this.user.favorites.includes(this.image.id)
				}, { headers: { 'Authorization': localStorage.getItem('token') } });

				if (this.user.favorites.includes(this.image.id))
					this.user.favorites.splice(this.user.favorites.indexOf(this.image.id), 1);
				else
					this.user.favorites.push(this.image.id);

				this.favoriteLoading = false;
			} catch(error) {
				console.error(error);
				this.$dialog.alert({
					type: 'is-danger',
					title: 'Error Updating Image Relationship',
					message: error ? error.response && error.response.data.message || error.message : 'Unknown Error',
					hasIcon: true
				});
				this.favoriteLoading = false;
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

<style lang="sass">
#base-post
	.info
		margin: 30px 0
		.button .icon:first-child:last-child
			margin-left: 0
			margin-right: 6px
		.relationship-buttons
			text-align: center
			margin-bottom: 20px
			.button:first-of-type
				margin-right: 10px
		.block
			margin: 10px 0
		.tag-list
			margin: 20px 0
			.tag
				margin: 2px
				button
					margin-left: 3px
		.edit-buttons
			text-align: center
			margin: 30px 0
			button
				margin: 5px
	.image-wrapper
		flex-basis: 76%
		display: flex
		justify-content: center
		align-items: flex-start
		img
			max-width: 100%
			max-height: 100%

</style>
