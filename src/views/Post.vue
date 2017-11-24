<template>
<div id="base-post">
	<div class="post-info" v-if="image">
		<div v-if="loggedIn && image.likes !== undefined" id="like-fav-buttons">
			<Button type="text" :class="{ no: !user.likes.includes(image.id) }" @click="like"><Icon type="thumbsup" size="30" color="#47dced" /></Button>
			<Button type="text" :class="{ no: !user.favorites.includes(image.id) }" @click="favorite"><Icon type="android-favorite" size="30" color="#ed4778" /></Button>
		</div>
		<p>Uploaded by <router-link :to="'/user/' + image.uploader.id">{{ image.uploader.username }}</router-link><br>on {{ new Date(image.createdAt).toLocaleString() }}</p>
		<p>
			<strong>Favorites:</strong> {{ image.favorites | humanize }}<br>
			<strong>Likes:</strong> {{ image.likes | humanize }}
		</p>
		<div v-if="editMode">
			<label for="nsfw">Adult content?</label>
			<i-switch name="nsfw" v-model="edits.nsfw" size="large">
				<span slot="open">Yes</span>
				<span slot="close">No</span>
			</i-switch>
		</div>
		<p v-if="image.artist && !editMode"><strong>Artist:</strong> {{ image.artist }}</p>
		<div v-if="editMode">
			<label for="artist">Artist</label>
			<Input name="artist" v-model="edits.artist" />
		</div>
		<div v-if="tags && tags.length > 0 && tags[0]">
			<Tag :closable="editMode" color="blue" class="tag" type="border" @on-close="deleteTag" v-for="tag of tags" :name="tag" :key="tag">{{ tag }}</Tag>
		</div>
		<p v-else>No tags</p>
		<div class="new-tag-input-wrapper" v-if="editMode">
			<Input placeholder="animal ears" v-model="newTag" :maxlength="40">
				<Button slot="append" size="small" @click="addTag">Add tag</Button>
			</Input>
		</div>
		<div id="edit-buttons" v-if="canEdit">
			<Button size="small" :type="editMode ? 'success' : 'info'" @click="editMode ? saveChanges(): enabledEditMode()">{{ editMode ? 'Save Changes' : 'Edit Post' }}</Button>
			<Button v-if="editMode" size="small" type="warning" @click="updateData">Discard Changes</Button>
			<Poptip v-if="!editMode" confirm title="Are you sure you want to delete this post?" @on-ok="deletePost" ok-text="yes" cancel-text="no" placement="bottom">
				<Button size="small" type="error">Delete Post</Button>
			</Poptip>
		</div>
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
				this.$Modal.error({
					title: 'Error Requesting Image Data',
					content: error ? error.response && error.response.data.message || error.message : 'Unknown Error'
				});
			}
		},
		saveChanges() {
			this.$http.patch(`${API_BASE_URL}images/${this.image.id}`, {
				tags: this.tags.join(','),
				artist: this.edits.artist,
				nsfw: this.edits.nsfw
			}, {
				headers: {
					'Authorization': localStorage.getItem('token')
				}
			}).then(() => this.updateData()).catch(error => {
				console.error(error);
				this.$Modal.error({
					title: 'Error Editing Post',
					content: error ? error.response && error.response.data.message || error.message : 'Unknown Error'
				});
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
				this.$Modal.error({
					title: 'Error Deleting Image',
					content: error ? error.response && error.response.data.message || error.message : 'Unknown Error'
				});
			}
		},
		deleteTag(e, name) {
			this.$parent.$delete(this.tags, this.tags.indexOf(name));
		},
		addTag() {
			if (this.newTag) {
				this.tags.push(this.newTag);
				this.newTag = '';
			}
		},
		async like() {
			if (this.likeLoading)
				return;

			this.likeLoading = true;

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
				this.$Modal.error({
					title: 'Error Updating Image Relationship',
					content: error ? error.response && error.response.data.message || error.message : 'Unknown Error'
				});
				this.likeLoading = false;
			}
		},
		async favorite() {
			if (this.favoriteLoading)
				return;

			this.favoriteLoading = true;

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
				this.$Modal.error({
					title: 'Error Updating Image Relationship',
					content: error ? error.response && error.response.data.message || error.message : 'Unknown Error'
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
	display: flex
	.post-info
		flex-basis: 24%
		min-width: 250px
		#edit-buttons
			margin-top: 2rem
			display: flex
			justify-content: space-around
			.ivu-poptip-body
				.ivu-icon
					position: relative
				.ivu-poptip-body-message
					display: inline-block
		#like-fav-buttons
			margin-bottom: 1rem
			button
				i
					transition: color .3s ease-in-out
				&.no i
					color: rgb(160, 160, 160) !important
		p:first-of-type
			margin-bottom: 1rem
		.tag
			display: inline-block
			margin-top: 2rem
			vertical-align: bottom
		.tag + .tag
			margin-top: 2px
		label
			font-weight: 700
			margin-right: .5rem
		.new-tag-input-wrapper
			margin-top: 10px
	.image-wrapper
		flex-basis: 76%
		display: flex
		justify-content: center
		align-items: flex-start
		img
			max-width: 100%
			max-height: 100%

</style>
