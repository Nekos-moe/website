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
		<b-field label="Tags" :message="['Required - Separate tags with a comma. Use spaces, not underscores or dashes', `Tags: ${totalTags}/80`]" :type="validity.tags.message ? 'is-danger' : null">
			<b-input @blur="validate" name='tags' type="textarea" v-model="details.tags" placeholder="cat ears, tail, paw pose"></b-input>
		</b-field>
		<b-field label="Artist" message="Use <a href='https://www.iqdb.org/' target='_blank'>iqdb</a> to find the source">
			<b-input :maxlength="60" icon="brush" v-model="details.artist"></b-input>
		</b-field>
		<b-field label="NSFW">
			<b-switch type="is-danger" v-model="details.nsfw">This post contains adult content</b-switch>
		</b-field>
		<button class="button" @click="promptForImportId"><b-icon icon="import"></b-icon>Import data from danbooru</button>
		<button class="button is-primary" @click="upload"><b-icon icon="upload"></b-icon>Upload</button>
	</div>
</div>
</template>

<script>
export default {
	data() {
		return {
			hasImage: false,
			details: {
				tags: '',
				artist: '',
				nsfw: false
			},
			validity: {
				tags: {
					check(value) {
						return value && value.replace(/,| |\n/g, '');
					},
					message: '',
					failMessage: 'All posts require tags'
				},
			},
			smallSize: false
		};
	},
	computed: {
		user() {
			return this.$store.state.user
		},
		totalTags() {
			return this.details.tags ? this.details.tags.split(',').length : 0;
		}
	},
	methods: {
		validate(e) {
			let name = e.target.name;
			if (!this.validity[name])
				return;

			if (!this.validity[name].check(e.target.value))
				this.validity[name].message = this.validity[name].failMessage;
			else if (this.validity[name].message)
				this.validity[name].message = '';
		},
		upload() {
			if (!this.validity.tags.check(this.details.tags))
				return this.$dialog.alert({
					type: 'is-warning',
					hasIcon: true,
					title: 'No Tags',
					message: 'All posts are required to have tags. If you need help tagging posts then head over to the uploading guidelines.'
				});

			let imageInput = document.getElementById('image');
			if (!imageInput.files[0]) {
				return this.$dialog.alert({
					type: 'is-warning',
					hasIcon: true,
					title: 'Missing Image',
					message: 'Please select an image to post.'
				});
			}
			if (imageInput.files[0].size > 3145728) {
				return this.$dialog.alert({
					type: 'is-warning',
					hasIcon: true,
					title: 'Image Too Large',
					message: 'The image you selected is too large. Select an image that is less than 3MB in size.'
				});
			}

			this.$Progress.start();

			let data = new FormData();
			data.append('image', imageInput.files[0]);
			data.append('artist', this.details.artist);
			data.append('tags', this.details.tags);
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
				this.details.tags = '';
				this.details.artist = '';
				this.details.nsfw = false;

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
				this.$Progress.fail();
				if (error.response && error.response.data.id) {
					return this.$dialog.alert({
						type: 'is-info',
						hasIcon: true,
						title: 'Image Already Uploaded',
						message: 'Sorry, someone else beat you to it :(',
						confirmText: 'View Post',
						onConfirm: () => {
							this.$router.push('/post/' + response.data.id);
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
		clickImage() {
			document.getElementById('image').click();
		},
		previewImage(e) {
			this.smallSize = false;
			if (!e.target.files || !e.target.files[0]) {
				document.getElementById('image-select').style.backgroundImage = '';
				document.getElementById('image-details').textContent = '';
				this.hasImage = false;
				return;
			}

			let reader = new FileReader(),
				filename = e.target.files[0].name,
				size = e.target.files[0].size;

			size = size / 1024;
			if (size >= 1024)
				size = (size / 1024).toFixed(2) + ' MB';
			else {
				if (size <= 100)
					this.smallSize = true;
				size = size.toFixed(2) + ' KB';
			}

			reader.onload = result => {
				setTimeout(() => {
					document.getElementById('image-select').style.backgroundImage = 'url(' + result.target.result + ')';
					document.getElementById('image-select').style.backgroundRepeat = 'no-repeat';
					document.getElementById('image-select').style.backgroundSize = 'cover';
					document.getElementById('image-select').style.backgroundPosition = 'center';
					document.getElementById('image-details').textContent = `${filename} — ${size}`;
				}, this.hasImage ? 0 : 300);
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
		importTags(id) {
			this.$Progress.start();
			return this.$http.get(`https://danbooru.donmai.us/posts/${id}.json`).then(response => {
				this.$Progress.finish();

				let tags = response.data.tag_string_general;
				if (response.data.tag_string_copyright)
					tags += ' ' + response.data.tag_string_copyright;
				if (response.data.tag_string_character)
					tags += ' ' + response.data.tag_string_character;

				this.details.tags = tags
					.replace(/ +/g, ', ').replace(/_/g, ' ').replace(/([0-9]\+?)(girls?|boys?|koma)/g, '$1 $2');
				this.details.artist = response.data.tag_string_artist.replace(/_/g, ' ');
			}).catch(error => {
				this.$Progress.fail();

				console.error(error);

				return this.$dialog.alert({
					type: 'is-danger',
					hasIcon: true,
					title: 'Error',
					message: error.response && error.response.data.message || error.message
				});
			});
		}
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
		margin: 2rem auto auto
		font-family: 'Nunito', sans-serif
		.button
			width: 100%
			&:first-of-type
				margin: 30px 0 20px
	.image-picker
		margin: 2rem auto
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
			transition: background 1.5s, box-shadow .3s, border-color .3s, color .3s, text-shadow .3s, border-width .2s
			outline: none !important
			&:hover:not(.has-image)
				border-width: 5px
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
			&.has-image
				display: block
		#small-size-warning
			margin: 10px auto 0
			max-width: 600px

</style>
