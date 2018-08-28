<template>
<div id="base-post">
	<div class="columns">
		<div class="column is-one-quarter info" v-if="image">
			<div class="header">
				<h2>Post Info</h2>
			</div>

			<div class="message is-warning" v-if="image.pending">
				<div class="message-body">
					This post is pending approval from a moderator. Until it is approved it will be unlisted.
				</div>
			</div>

			<div class="upload-info">
				<p><strong>Uploader:</strong> <router-link :to="'/user/' + image.uploader.id">{{ image.uploader.username }}</router-link></p>
				<p v-if="image.approver"><strong>Approver:</strong> <router-link :to="'/user/' + image.approver.id">{{ image.approver.username }}</router-link></p>
				<p><strong>Uploaded:</strong> {{ new Date(image.createdAt).toLocaleString() }}</p>
				<p v-if="image.artist"><strong>Artist:</strong> {{ image.artist }}</p>
			</div>

			<b-field v-if="editMode" label="Artist:" horizontal size="is-small">
				<b-input v-model="edits.artist" size="is-small"></b-input>
			</b-field>
			<div class="field" v-if="editMode">
				<b-checkbox v-model="edits.nsfw" type="is-danger">Adult Content</b-checkbox>
			</div>

			<p class="relationship" v-if="!image.pending">
				<button v-if="loggedIn && user" class="button is-info" :class="{ 'is-outlined': !user.likes.includes(image.id) }"
					@click="like"><b-icon icon="thumb-up"></b-icon>{{ image.likes }} Like{{ image.likes !== 1 ? 's' : '' }}</button>
				<button v-if="loggedIn && user" class="button is-danger" :class="{ 'is-outlined': !user.favorites.includes(image.id) }"
					@click="favorite"><b-icon icon="heart"></b-icon>{{ image.favorites }} Favorite{{ image.favorites !== 1 ? 's' : '' }}</button>

				<button v-if="!loggedIn || !user" class="button is-white"><b-icon icon="thumb-up">
					</b-icon>{{ image.likes }} Like{{ image.likes !== 1 ? 's' : '' }}</button>
				<button v-if="!loggedIn || !user" class="button is-white"><b-icon icon="heart">
					</b-icon>{{ image.favorites }} Favorite{{ image.favorites !== 1 ? 's' : '' }}</button>
			</p>

			<div class="tags">
				<div class="sub-header">
					<p>Tags</p>
				</div>
				<div class="tag-list" :class="{ 'edit-mode': editMode }" v-if="tags && tags.length > 0 && tags[0]">
					<span v-for="(tag, i) of tags" :key="i" class="tag"
						:class="{ 'is-danger': (editMode ? edits.nsfw : image.nsfw), 'is-primary': !(editMode ? edits.nsfw : image.nsfw) }"
						@click="!editMode && searchTag(tag)">{{ tag }}
						<button v-show="editMode" class="delete is-small" @click="deleteTag(tag)"></button>
					</span>
				</div>
				<p v-else>No tags</p>

				<b-field v-if="editMode">
					<b-input v-model="newTag" size="is-small" placeholder="paw pose" expanded></b-input>
					<p class="control">
						<button class="button is-small" @click="addTag">Add tag</button>
					</p>
				</b-field>
			</div>

			<div class="edit-buttons" v-if="canEdit">
				<div class="sub-header">
					<p>Post Options</p>
				</div>
				<button v-show="!editMode" class="button is-warning" @click="enableEditMode"><b-icon icon="pencil"></b-icon>Edit Post</button>
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
					params: { pending: !!this.image.pending },
					headers: { Authorization: localStorage.getItem('token') }
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

				if (this.user.likes.includes(this.image.id)) {
					this.user.likes.splice(this.user.likes.indexOf(this.image.id), 1);
					this.image.likes--;
				} else {
					this.user.likes.push(this.image.id);
					this.image.likes++;
				}

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

				if (this.user.favorites.includes(this.image.id)) {
					this.user.favorites.splice(this.user.favorites.indexOf(this.image.id), 1);
					this.image.favorites--;
				} else {
					this.user.favorites.push(this.image.id);
					this.image.favorites++;
				}

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
		},
		searchTag(tag) {
			return this.$router.push(`/search/images?tags="${tag}"`);
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
		.button .icon
			margin-left: 0
			margin-right: 6px
			i::before
				font-size: 22px
				vertical-align: text-bottom
		.field
			&:not(:last-child)
				margin-bottom: 4px
			& + .relationship
				margin-top: 30px
			.field-label
				font-size: 16px
				padding-top: 0
				text-align: left
				label
					display: inline-block
					vertical-align: middle
		.header
			border-bottom: 2px solid #4A4A4A
			margin-bottom: 30px
			padding-bottom: 4px
			width: 100%
			h2
				font-size: 28px
				font-weight: 700
				line-height: 28px
		.sub-header
			border-bottom: 1px solid #4A4A4A
			font-weight: 700
			margin-bottom: 8px
			width: 100%
		.message .message-body
			padding: .75em 1em
		.upload-info, .relationship, .tags
			margin-bottom: 30px
		.relationship
			display: flex
			justify-content: space-around
		.tags
			.tag-list
				margin: -2px
				&.edit-mode .tag
					user-select: unset
					&:hover
						cursor: auto
				.tag
					margin: 2px
					user-select: none
					&:hover
						cursor: pointer
					button
						margin-left: 3px
			.field
				margin-top: 8px
				width: 100%
		.edit-buttons
			display: flex
			flex-wrap: wrap
			justify-content: space-around
	.image-wrapper
		flex-basis: 76%
		display: flex
		justify-content: center
		align-items: flex-start
		img
			max-width: 100%
			max-height: 100%

</style>
