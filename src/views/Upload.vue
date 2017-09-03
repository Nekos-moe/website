<template>
<div id="base-upload">
	<Modal type="success" v-model="successModal" title="Image Uploaded">
		<p>You image has successfully been uploaded.</p>
		<router-link :to="'/post/' + modalLinkId">You can view it here</router-link>
	</Modal>
	<Modal type="warning" v-model="dupeModal" title="Image Already Uploaded">
		<p>Sorry, someone else beat you to it :(</p>
		<router-link :to="'/post/' + modalLinkId">View post</router-link>
	</Modal>
	<div class="image-picker">
		<input type="file" id="image" accept=".png,.jpg,.jpeg" @change="previewImage">
		<button :class="{ 'has-image': hasImage }" id="image-select" @click="clickImage">Select Image</button>
		<p :class="{ 'has-image': hasImage }" id="image-details"></p>
	</div>
	<p>New to uploading? <router-link to="/uploading-guidelines">Read our uploading guidelines</router-link></p>
	<div class="import">
		<Button v-show="!promptingUser" @click="promptingUser = true">Import data from danbooru</Button>
		<Input v-show="promptingUser" class="input" name="import-id" number placeholder="Post ID" value="" @enter="importTags" size="large"></Input>
		<Button v-show="promptingUser" @click="importTags">Import</Button>
	</div>
	<Form ref="details" :model="details" label-position="left" class="details">
		<Form-item label="Tags">
			<p style="font-size: 14px; clear: both; display: block; line-height: 16px; margin-bottom: 8px">Seperate with a comma. Use spaces, not underscores or dashes</p>
			<Input v-model="details.tags" type="textarea" placeholder="cat girls, best girls" autosize></Input>
		</Form-item>
		<Form-item label="Artist">
			<p style="font-size: 14px; clear: both; display: block; line-height: 16px; margin-bottom: 8px">Use <a href="https://www.iqdb.org/" target="_blank">iqdb</a> to find the source</p>
			<Input v-model="details.artist" placeholder="Artist" icon="paintbrush"></Input>
		</Form-item>
		<Form-item label="Adult content?" label-position="right">
			<i-switch v-model="details.nsfw" value="details.nsfw" size="large">
				<span slot="open">Yes</span>
				<span slot="close">No</span>
			</i-switch>
		</Form-item>
		<Button type="success" @click="upload()" long>Upload</Button>
	</Form>
</div>
</template>

<script>
export default {
	data() {
		return {
			hasImage: false,
			promptingUser: false,
			details: {
				tags: '',
				artist: '',
				nsfw: false
			},
			successModal: false,
			dupeModal: false,
			modalLinkId: ''
		};
	},
	computed: {
		user() {
			return this.$store.state.user
		}
	},
	methods: {
		upload() {
			let imageInput = document.getElementById('image');
			if (!imageInput.files[0]) {
				this.$Modal.warning({
					title: 'Missing Image',
					content: 'Please select an image to post'
				});
				return;
			}
			if (imageInput.files[0].size > 3145728) {
				this.$Modal.warning({
					title: 'Image Too Large',
					content: 'The image you selected is too large. Select an image that is less than 3MB in size.'
				});
				return;
			}

			this.$Progress.start();

			let data = new FormData();
			data.append('image', imageInput.files[0]);
			data.append('artist', this.details.artist);
			data.append('tags', this.details.tags);
			if (this.details.nsfw)
				data.append('nsfw', 'true');

			this.$http.post(API_BASE_URL + 'images', data, {
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
				this.details.tags = undefined;
				this.details.artist = undefined;
				this.details.nsfw = false;

				this.modalLinkId = response.data.image.id;
				this.successModal = true;
			}).catch(error => {
				this.$Progress.fail();
				if (error.response && error.response.data.id) {
					this.modalLinkId = error.response.data.id;
					this.dupeModal = true;
					return;
				}
				console.error(error);
				this.$Modal.error({
					title: 'Error Uploading Image',
					content: error.response && error.response.data.message || error.message
				});
			});
		},
		clickImage() {
			document.getElementById('image').click();
		},
		previewImage(e) {
			if (!e.target.files || !e.target.files[0]) {
				document.getElementById('image-select').style.backgroundImage = '';
				document.getElementById('image-details').textContent = '';
				this.hasImage = false;
				return;
			}

			let reader = new FileReader(),
				filename = e.target.files[0].name.replace(/\..+?$/, ''),
				size = e.target.files[0].size;

			size = size / 1024;
			if (size >= 1024)
				size = (size / 1024).toFixed(2) + ' MB';
			else
				size = size.toFixed(2) + ' KB';

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
		importTags() {
			let id = document.getElementsByName('import-id')[0];

			this.$Progress.start();
			this.$http.get(`https://danbooru.donmai.us/posts/${id.value}.json`).then(response => {
				this.$Progress.finish();
				this.promptingUser = false;

				this.details.tags = response.data.tag_string
					.replace(response.data.tag_string_artist, '')
					.replace(/(md5 mismatch|commentary request|commentary|translation request|translated|check translation|translation check|translation note|copyright ?\w*)/g, '') // remove unwanted tags
					.replace(/ +/g, ', ');
				this.details.artist = response.data.tag_string_artist;
				id.value = null;
			}).catch(error => {
				this.$Progress.fail();
				this.promptingUser = false;

				console.error(error);
				this.$Modal.error({
					title: 'Error',
					content: error.response && error.response.data.message || error.message
				});
			});
		}
	}
}
</script>

<style lang="sass" scoped>
#base-upload
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
	.details
		width: 100%
		max-width: 400px
		margin-top: 2rem
	.image-picker
		margin: 2rem auto
		text-align: center
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
		p
			display: none
			font-family: 'Nunito', sans-serif
			color: #444
			&.has-image
				display: block

.form
	margin: 1rem auto auto
	width: 40%
	min-width: 300px
	color: #222
	font-family: 'Nunito', sans-serif
	h4
		text-align: center
		font-size: 2rem
		margin: 1rem
	input:not([type="checkbox"]), button
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
		height: 68px
		resize: vertical
	button
		margin: .5rem auto
		padding: 5px 10px
		cursor: pointer
		font-family: 'Nunito', sans-serif
		font-size: 18px
		color: #FFF
		background-color: #4ACFFF
		box-shadow: 0 0 3px rgba(#4ACFFF, .4)
		border: none
		border-radius: 3px
		transition: background .3s
		&:hover, &:focus
			background: darken(#4ACFFF, 15)
	.import
		margin: .5rem 0 1rem 0
		display: flex
		align-items: center
		*
			margin: 0
			display: inline-block
		button
			font-size: 17px
			padding: 3px 8px
		input
			margin-right: .5rem
			width: 100px
</style>
