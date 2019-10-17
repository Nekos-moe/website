<template>
<div id="base-upload">
	<div class="image-picker">
		<input type="file" id="image" accept=".png,.jpg,.jpeg" @change="previewImage">
		<button :class="{ 'has-image': hasImage }" id="image-select" @click="clickImage">Select Image</button>
		<p :class="{ 'has-image': hasImage }" id="image-details"></p>
		<b-message type="is-warning" id="small-size-warning" v-show="smallSize" has-icon>This image is less than 100 KB.<br>Are you sure it follows our uploading guidelines?</b-message>
	</div>
	<p>New to uploading? <router-link to="/uploading-guidelines">Read our uploading guidelines</router-link></p>

	<div class="form">
		<b-field label="Tags" :message="['Required - Be detailed! There\'s a tag for almost every element of an image']">
			<b-taginput
				v-model="details.tags"
				maxtags="120"
				maxlength="50"
				placeholder="paw pose"
				autocomplete
				allow-new
				:data="filteredTags"
				@typing="getFilteredTags"></b-taginput>
		</b-field>
		<b-field label="Artist" message="Use <a href='https://www.iqdb.org/' target='_blank'>iqdb</a> to find the source">
			<b-input :maxlength="60" icon="brush" v-model="details.artist"></b-input>
		</b-field>
		<b-field label="NSFW">
			<b-switch type="is-danger" v-model="details.nsfw">This post contains adult content</b-switch>
		</b-field>
		<button class="button" @click="promptForImportId"><b-icon icon="import"></b-icon>Import from danbooru</button>
		<button class="button is-primary" @click="upload" :class="{ 'is-loading': uploading }"><b-icon icon="upload"></b-icon>Upload</button>
	</div>
</div>
</template>

<script>
export default {
	data() {
		return {
			hasImage: false,
			details: {
				tags: [],
				artist: '',
				nsfw: false
			},
			allTags: [],
			filteredTags: [],
			smallSize: false,
			uploading: false,
			importedImage: null,
			size: null // TODO: Migrate smallSize
		};
	},
	computed: {
		user() {
			return this.$store.state.user
		}
	},
	methods: {
		getFilteredTags(input) {
			input = input.toLowerCase();

			this.filteredTags = input ? this.allTags.filter(tag => tag.toLowerCase().indexOf(input) > -1) : this.allTags;
			return;
		},
		async getTags() {
			try {
				const response = await this.$http.get(API_BASE_URL + 'tags');

				this.allTags = response.data.tags;
				return;
			} catch (error) {
				if (!error.response)
					return console.error(error.message);
				return console.error(error.response);
			}
		},
		async upload() {
			if (this.uploading)
				return;

			if (this.details.tags.length === 0)
				return this.$dialog.alert({
					type: 'is-warning',
					hasIcon: true,
					title: 'No Tags',
					message: 'All posts are required to have tags. If you need help tagging posts then head over to the uploading guidelines.'
				});

			let proceed = true;
			if (this.details.tags.length <= 10)
				proceed = await this.confirm('Low Tag Count', "Your post doesn't have many tags! We require all posts to have detailed tags so they can be searched easily. If you need help tagging posts then head over to the uploading guidelines.");

			if (proceed === false)
				return;

			let imageInput = document.getElementById('image');
			if (!imageInput.files[0] && !this.importedImage) {
				return this.$dialog.alert({
					type: 'is-warning',
					hasIcon: true,
					title: 'Missing Image',
					message: 'Please select an image to post.'
				});
			}
			if (this.size > 3145728) {
				return this.$dialog.alert({
					type: 'is-warning',
					hasIcon: true,
					title: 'Image Too Large',
					message: 'The image you selected is too large. Select an image that is less than 3MB in size.'
				});
			}

			this.uploading = true;
			this.$Progress.start();

			let data = new FormData();
			data.append('image', this.importedImage || imageInput.files[0]);
			data.append('artist', this.details.artist);
			for (const tag of this.details.tags)
				data.append('tags[]', tag);
			if (this.details.nsfw)
				data.append('nsfw', 'true');

			return this.$http.post(API_BASE_URL + 'images', data, {
				responseType: 'json',
				headers: {
					'Authorization': localStorage.getItem('token')
				},
				onUploadProgress: progress => {
					if (progress.lengthComputable)
						this.$Progress.set(progress.loaded / progress.total * 100);
				}
			}).then(response => {
				this.$Progress.finish();
				document.getElementById('image-select').style.backgroundImage = '';
				document.getElementById('image-details').textContent = '';
				this.hasImage = false;
				this.importedImage = null;
				this.smallSize = false;
				this.size = null;
				this.details.tags = [];
				this.details.artist = '';
				this.details.nsfw = false;

				this.uploading = false;
				return this.$dialog.alert({
					type: 'is-success',
					hasIcon: true,
					title: 'Uploaded',
					message: 'You image has successfully been uploaded. It is now pending approval.',
					confirmText: 'View Post',
					onConfirm: () => {
						this.$router.push('/post/' + response.data.image.id);
					},
					canCancel: ['escape', 'button', 'outside'],
					cancelText: 'Close'
				});
			}).catch(error => {
				this.uploading = false;
				this.$Progress.fail();
				if (error.response && error.response.data.id) {
					return this.$dialog.alert({
						type: 'is-info',
						hasIcon: true,
						title: 'Image Already Uploaded',
						message: 'Sorry, someone else beat you to it :(',
						confirmText: 'View Post',
						onConfirm: () => {
							this.$router.push('/post/' + error.response.data.id);
						},
						canCancel: ['escape', 'button', 'outside'],
						cancelText: 'Close'
					});
				}
				console.error(error);
				return this.$dialog.alert({
					type: 'is-danger',
					hasIcon: true,
					title: 'Error Uploading Image',
					message: error.response && error.response.data.message || error.message
				});
			});
		},
		confirm(title, message) {
			return new Promise(resolve => {
				return this.$dialog.confirm({
					title,
					message,
					type: 'is-warning',
					hasIcon: true,
					confirmText: 'Upload anyways',
					onConfirm() {
						return resolve(true);
					},
					onCancel() {
						return resolve(false);
					},
				});
			});
		},
		clickImage() {
			document.getElementById('image').click();
		},
		previewImage(e) {
			if (!e.target.files || !e.target.files[0]) {
				if (!this.importedImage) {
					document.getElementById('image-select').style.backgroundImage = '';
					document.getElementById('image-details').textContent = '';

					this.hasImage = false;
					this.smallSize = false;
					this.size = null;
				}
				return;
			}

			this.smallSize = false;
			this.importedImage = null; // Only delete imported image if a local one was selected

			const reader = new FileReader();
			const filename = e.target.files[0].name;
			const size = this.formatFileSize(e.target.files[0].size);
			this.size = e.target.files[0].size;

			reader.onload = result => {
				setTimeout(() => {
					document.getElementById('image-select').style.backgroundImage = 'url(' + result.target.result + ')';
					document.getElementById('image-select').style.backgroundRepeat = 'no-repeat';
					document.getElementById('image-select').style.backgroundSize = 'cover';
					document.getElementById('image-select').style.backgroundPosition = 'center';
					document.getElementById('image-details').textContent = `${filename} — ${size}`;
				}, 300);
				this.hasImage = true;
			};

			return reader.readAsDataURL(e.target.files[0]);
		},
		promptForImportId() {
			return this.$dialog.prompt({
				message: "What is the post's ID?",
				inputAttrs: {
					type: 'number',
					placeholder: '/post/...',
				},
				onConfirm: value => this.importTags(value)
			});
		},
		async importTags(id) {
			this.$Progress.start();

			this.importedImage = null;

			try {
				const response = await this.$http.get(`https://danbooru.donmai.us/posts/${id}.json`);
				this.$Progress.finish();

				let tags = response.data.tag_string_general;
				if (response.data.tag_string_copyright)
					tags += ' ' + response.data.tag_string_copyright;
				if (response.data.tag_string_character)
					tags += ' ' + response.data.tag_string_character;

				this.details.tags = tags.replace(/ +/g, ',')
					.replace(/_/g, ' ')
					.replace(/([0-9]\+?)(girls?|boys?|koma)/g, '$1 $2')
					.split(',');
				this.details.artist = response.data.tag_string_artist.replace(/_/g, ' ');

				if (response.data.rating !== 's')
					this.details.nsfw = true;

				if (!['jpg', 'png', 'jpeg'].includes(response.data.file_ext))
					return this.$snackbar.open({
						message: 'Imported image was not a jpg or png',
						type: 'is-warning'
					});

				if (response.data.file_size > 3145728) {
					return this.$dialog.alert({
						type: 'is-warning',
						hasIcon: true,
						title: 'Image Too Large',
						message: 'This image was unable to be imported because it exceeds the size limit of 3MB. Please resize the image down to a maximum of 2,000 pixels or convert it to a high-quality JPG.'
					});
				}

				document.getElementById('image').value = '';
				document.getElementById('image-select').style.backgroundImage = '';
				document.getElementById('image-details').textContent = '';

				const imageRes = await this.$http.get(API_BASE_URL + 'proxy/danbooru', {
					params: { url: response.data.file_url },
					headers: { 'Authorization': localStorage.getItem('token') }
				});

				const bstr = atob(imageRes.data.data);
				let i = bstr.length;
				const u8arr = new Uint8Array(i);
				while (i--)
					u8arr[i] = bstr.charCodeAt(i);

				this.importedImage = new File([u8arr], `${response.data.md5}.${response.data.file_ext}`, { type: imageRes.data.type });
				this.hasImage = true;

				this.smallSize = false;
				this.size = response.data.file_size;
				const size = this.formatFileSize(response.data.file_size);

				document.getElementById('image-select').style.backgroundImage = `url(data:${imageRes.data.type};base64,${imageRes.data.data})`;
				document.getElementById('image-select').style.backgroundRepeat = 'no-repeat';
				document.getElementById('image-select').style.backgroundSize = 'cover';
				document.getElementById('image-select').style.backgroundPosition = 'center';
				document.getElementById('image-details').textContent = `danbooru:${response.data.id} — ${size}`;
			} catch (error) {
				this.$Progress.fail();

				console.error(error);

				return this.$dialog.alert({
					type: 'is-danger',
					hasIcon: true,
					title: 'Error',
					message: error.response && error.response.data.message || error.message
				});
			}
		},
		formatFileSize(size) {
			size = size / 1024;
			if (size >= 1024)
				size = (size / 1024).toFixed(2) + ' MB';
			else {
				if (size <= 100)
					this.smallSize = true;
				size = size.toFixed(2) + ' KB';
			}

			return size;
		}
	},
	beforeMount() {
		this.getTags();
	}
}
</script>

<style lang="sass">
#base-upload
	.button .icon:first-child:last-child
		margin-left: 0
		margin-right: 6px
	& > *
		margin: auto
	& > p
		text-align: center
	.import
		text-align: center
		margin: 20px 0
		.input
			width: 160px
			margin: 0 10px
	.form
		width: 100%
		max-width: 600px
		margin: 40px auto
		font-family: 'Nunito', sans-serif
		.button
			width: 100%
			&:first-of-type
				margin: 30px 0 20px
	.image-picker
		margin: 40px auto 20px
		text-align: center
		font-family: 'Nunito', sans-serif
		button
			margin: auto
			padding: 10px
			width: 400px
			height: 400px
			cursor: pointer
			color: #444
			font-size: 2rem
			font-family: 'Nunito', sans-serif
			border: 4px dashed #96abec
			border-radius: 1rem
			box-shadow: none
			background: #fff
			transition: background 1.5s, box-shadow .3s, border-color .3s, color .3s, text-shadow .3s
			outline: none !important
			&.has-image
				color: transparent
				border: none
				box-shadow: 1px 2px 5px rgba(0, 0, 0, .3)
				&:hover
					color: #FFF
					text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000
		#image
			display: none
		#image-details
			display: none
			color: #444
			padding-top: 4px
			&.has-image
				display: block
		#small-size-warning
			margin: 10px auto 0
			max-width: 600px

</style>
