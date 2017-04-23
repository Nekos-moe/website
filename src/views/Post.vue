<template>
<div id="base-post">
	<div class="post-info" v-if="image">
		<div id="edit-buttons" v-if="canEdit">
			<Button :type="editMode ? 'success' : 'info'" @click="editMode ? saveChanges(): editMode = true">{{ editMode ? 'Save Changes' : 'Edit Post' }}</Button>
			<Button v-if="editMode" type="warning" @click="updateData">Discard Changes</Button>
			<Poptip v-if="!editMode" confirm title="Are you sure you want to delete this post?" @on-ok="deletePost" ok-text="yes" cancel-text="no" placement="bottom">
				<Button type="error">Delete Post</Button>
			</Poptip>
		</div>
		<p>Uploaded by <router-link :to="'/user/' + image.uploader.id">{{ image.uploader.username }}</router-link><br>on {{ new Date(image.createdAt).toLocaleString() }}</p>
		<p>
			<strong>Favorites:</strong> {{ image.favorites | humanize }}<br>
			<strong>Likes:</strong> {{ image.likes | humanize }}
		</p>
		<div v-if="editMode">
			<label for="nsfw">Adult content?</label>
			<i-switch name="nsfw" v-model="edits.nsfw" :value="image.nsfw" size="large">
				<span slot="open">Yes</span>
				<span slot="close">No</span>
			</i-switch>
		</div>
		<p v-if="image.artist && !editMode"><strong>Artist:</strong> {{ image.artist }}</p>
		<div v-if="editMode">
			<label for="artist">Artist</label>
			<Input name="artist" v-model="edits.artist" :value="image.artist"></Input>
		</div>
		<Tag :closable="editMode" color="blue" class="tag" type="border" @on-close="deleteTag" v-for="tag of tags" :name="tag" :key="tag">{{ tag }}</Tag>
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
				artist: null
			}
		};
	},
	computed: {
		user() {
			return this.$store.state.user;
		},
		canEdit() {
			return this.image && this.user && (this.user.roles.includes('admin') || this.user.roles.includes('editPosts') || this.image.uploader.id === this.user.id);
		}
	},
	methods: {
		async updateData() {
			try {
				let response = await this.$http.get(`${API_BASE_URL}images/${this.$route.params.id}`, {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				});

				this.image = response.data.image;
				this.tags = response.data.image.tags.split(',');
				this.edits.artist = response.data.image.artist;
				this.edits.nsfw = response.data.image.nsfw;
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
			let tags = [...document.getElementsByClassName('ivu-tag-text')].map(e => e.innerHTML).join(',');
			this.$http.patch(`${API_BASE_URL}images/${this.image.id}`, {
				tags,
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
		flex-basis: 30%
		min-width: 250px
		#edit-buttons
			text-align: center
			margin-bottom: 1rem
			.ivu-poptip-body
				.ivu-icon
					position: relative
				.ivu-poptip-body-message
					display: inline-block
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
	.image-wrapper
		flex-basis: 70%
		display: flex
		justify-content: center
		align-items: flex-start
		img
			max-width: 100%
			max-height: 100%

</style>
