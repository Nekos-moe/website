<template>
<div id="base">
	<div class="post-info" v-if="image">
		<div id="edit-buttons" v-if="canEdit">
			<button v-if="!editMode" class="btn" @click="editMode = true">Edit Post</button>
			<button v-if="!editMode" class="btn danger" @click="deletePost">Delete Post</button>

			<button v-if="editMode" class="btn" @click="saveChanges">Save Changes</button>
			<button v-if="editMode" class="btn warn" @click="editMode = false">Cancel</button>
		</div>
		<p>Uploaded by <router-link :to="'/user/' + image.uploader.id">{{ image.uploader.username }}</router-link><br>on {{ new Date(image.createdAt).toLocaleString() }}</p>
		<p>
			<strong>Favorites:</strong> {{ image.favorites | humanize }}<br>
			<strong>Likes:</strong> {{ image.likes | humanize }}
		</p>
		<div v-if="editMode">
			<label for="nsfw"><strong>Adult content?</strong></label>
			<input type="checkbox" id="nsfw" name="nsfw" :checked="image.nsfw">
		</div>
		<p v-if="image.artist && !editMode"><strong>Artist:</strong> {{ image.artist }}</p>
		<div v-if="editMode">
			<label for="artist">Artist</label>
			<input type="text" name="artist" id="artist" :value="image.artist">
		</div>
		<span v-if="!editMode" class="tag" v-for="tag of image.tags.split(',')">{{ tag }}</span>
		<div v-if="editMode">
			<label for="tags">Tags</label>
			<textarea type="text" name="tags" id="tags">{{ image.tags.replace(/,/g, ', ') }}</textarea>
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
			editMode: false
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
			} catch(error) {
				console.error(error);
				this.$parent.$data.modalData = {
					title: 'Request Error',
					body: error.response && error.response.data.message || error.message,
					type: 'error'
				};
			}
		},
		async saveChanges() {
			await this.$http.patch(`${API_BASE_URL}images/${this.image.id}`, {
				artist: document.getElementById('artist').value,
				tags: document.getElementById('tags').value,
				nsfw: document.getElementById('nsfw').checked
			}, {
				headers: {
					'Authorization': localStorage.getItem('token')
				}
			}).catch(error => {
				console.error(error);
				this.$parent.$data.modalData = {
					title: 'Error Editing Post',
					body: error.response && error.response.data.message || error.message,
					type: 'error'
				};
			});

			this.updateData();
			this.editMode = false;
		},
		deletePost() {
			this.$parent.$data.modalData = {
				title: 'Are you sure?',
				body: "This will remove this image from nekos.brussell.me. This action cannot be reversed.",
				type: 'error',
				buttons: [{ text: 'Cancel' }, { text: 'Delete', type: 'error' }],
				callback: async e => {
					if (e.target.innerHTML === 'Delete') {
						try {
							await this.$http.delete(`${API_BASE_URL}images/${this.image.id}`, {
								headers: {
									'Authorization': localStorage.getItem('token')
								}
							});

							this.$router.push('/');
						} catch(error) {
							console.error(error);
							this.$parent.$data.modalData = {
								title: 'Request Error',
								body: error.response && error.response.data.message || error.message,
								type: 'error'
							};
						}
					}
				}
			};
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

<style lang="sass" scoped>
#base
	display: flex
	.post-info
		flex-basis: 25%
		min-width: 250px
		#edit-buttons
			text-align: center
		.tag, input:not([type="checkbox"])
			display: block
			display: block
		input[type="checkbox"]
			width: auto
			vertical-align: middle
			margin-left: 5px
			margin-top: 1rem
		input, textarea
			margin: .5rem 0 1rem 0
			padding: 4px 8px
			width: 100%
			font-family: 'Nunito', sans-serif
			font-size: 14px
			border: 1px solid #CCC
			border-radius: 3px
			outline: #4ACFFF auto 0
			&:focus
				border-color: #4ACFFF
				outline: #4ACFFF auto 5px
		textarea
			height: 143px
			resize: vertical
	.image-wrapper
		flex-basis: 65%
		display: flex
		justify-content: center
		align-items: flex-start
		img
			max-width: 100%
			max-height: 100%

</style>
