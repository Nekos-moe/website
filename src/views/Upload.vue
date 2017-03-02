<template>
<body>
	<div id="base">
		<div class="image-picker">
			<input type="file" id="image" accept=".png,.jpg,.jpeg" @change="previewImage">
			<button :class="{ 'has-image': hasImage }" id="image-select" @click="clickImage">Select Image</button>
			<p :class="{ 'has-image': hasImage }" id="image-details"></p>
		</div>
		<div class="form">
			<h4>Details</h4>
			<label for="tags"><strong>Tags:</strong> Seperate with a comma. Use spaces, not underscores or dashes</label>
			<input type="text" id="tags" placeholder="cat girls, best girls" name="tags">
			<label for="artist"><strong>Artist:</strong> Use <a href="https://www.iqdb.org/" target="_blank">iqdb</a> to find the source</label>
			<input type="text" id="artist" placeholder="Artist" name="artist">
			<label for="nsfw"><strong>Adult content?</strong></label>
			<input type="checkbox" id="nsfw" name="nsfw">
			<button type="button" @click="upload()">Upload</button>
		</div>
	</div>
</body>
</template>

<script>
export default {
	data() {
		return {
			hasImage: false
		};
	},
	computed: {
		user() {
			return this.$store.state.user
		}
	},
	methods: {
		upload() {
			this.$Progress.start();

			let data = new FormData();
			data.append('image', document.getElementById('image').files[0]);
			data.append('artist', document.getElementById('artist').value);
			data.append('tags', document.getElementById('tags').value);
			data.append('nsfw', document.getElementById('nsfw').checked);

			this.$http.post(API_BASE_URL + 'images', data, {
				responseType: 'arraybuffer',
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
				// TODO: Image uploaded ot fklbgarhligbaerlihgaelbgrt
				// Display that in some fancy way
			}).catch(error => {
				this.$Progress.fail();
				console.error(error);
				// TODO: Display that too
			});
		},
		clickImage() {
			document.getElementById('image').click();
		},
		previewImage(e) {
			if (!e.target.files || !e.target.files[0])
				return;

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
					document.getElementById('image-details').textContent = `${filename} — ${size}`;
				}, this.hasImage ? 0 : 300);
				this.hasImage = true;
			}

			return reader.readAsDataURL(e.target.files[0]);
		}
	}
}
</script>

<style lang="sass" scoped>
.form
	margin: auto
	margin-top: 1rem
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
	input
		margin: .5rem 0 1rem 0
		padding: 4px 8px
		width: 100%
		font-size: 14px
		border: 1px solid #CCC
		border-radius: 3px
		outline: #4ACFFF auto 0
		&:focus
			border-color: #4ACFFF
			outline: #4ACFFF auto 5px
	button
		margin: auto
		margin-top: .5rem
		padding: 5px 10px
		cursor: pointer
		font-size: 20px
		color: #FFF
		background-color: #4ACFFF
		box-shadow: 0 0 3px rgba(#4ACFFF, .4)
		border: none
		border-radius: 3px
		transition: background .3s
		&:hover, &:focus
			background: darken(#4ACFFF, 15)
	a
		color: #2de58c !important
		text-decoration: none

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
		border: 5px dashed #4ACFFF
		border-radius: 1rem
		box-shadow: none
		background-color: #FFF
		background-size: cover
		background-position: center
		transition: background 1.5s, box-shadow .3s, border-color .3s, color .3s, text-shadow .3s
		outline: none !important
		&:hover:not(.has-image)
			border: 5px dashed darken(#4ACFFF, 25)
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
</style>
