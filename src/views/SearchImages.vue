<template>
<body>
	<div id="base">
		<div class="search-wrapper">
			<textarea type="text" id="tags" value="" placeholder="Tags"></textarea>
			<br>
			<label for="nsfw">NSFW Results</label>
			<select id="nsfw" name="nsfw">
				<option value="undefined">I Don't Care</option>
				<option value="true">Only NSFW</option>
				<option value="false" selected>Block NSFW</option>
			</select>
			<br>
			<label for="sort">Sort</label>
			<select id="sort" name="sort">
				<option value="default" selected>Default</option>
				<option value="recent">Recent</option>
				<option value="likes">Likes</option>
			</select>
			<br>
			<!-- posted_before -->
			<!-- posted_after -->
			<input type="text" id="artist" value="" placeholder="Artist">
			<br>
			<input type="text" id="uploader" value="" placeholder="Uploader">
			<br>
			<div class="button-wrapper">
				<button type="button" @click="getResults">Search</button>
			</div>
		</div>
		<div class="images-wrapper">
			<div class="navigation-buttons">
				<button @click="previous">Previous</button>
				<button @click="next">Next</button>
			</div>
			<!-- Todo: Show match score -->
			<div class="images">
				<image-preview v-for="(image, index) of images" v-show="~~(index / 9) === page - 1" :image="image"></image-preview>
			</div>
			<div class="navigation-buttons">
				<button @click="previous">Previous</button>
				<button @click="next">Next</button>
			</div>
		</div>
	</div>
</body>
</template>

<script>
export default {
	data() {
		return {
			IMAGE_BASE_URL,
			images: [],
			page: 1
		};
	},
	computed: {
		user() {
			return this.$store.state.user
		}
	},
	methods: {
		previous() {
			if (this.page !== 1)
				this.page--;
		},
		next() {
			if (this.page < this.images.length / 9)
				this.page++;
		},
		getResults() {
			this.$Progress.start();
			let tags = document.getElementById('tags').value,
				nsfw = {
					'undefined': undefined,
					'false': false,
					'true': true
				}[document.getElementById('nsfw').value];

			this.$http.post(API_BASE_URL + 'images/search', {
				nsfw,
				tags: tags ? tags + ' ' + this.$store.getters.blacklist : this.$store.getters.blacklist,
				sort: document.getElementById('sort').value,
				artist: document.getElementById('artist').value,
				uploader: document.getElementById('uploader').value
			}, {
				responseType: 'json',
				headers: {
					'Authorization': localStorage.getItem('token')
				}
			}).then(response => {
				this.images = response.data.images;
				this.$Progress.finish();
			}).catch(error => {
				this.$Progress.fail();
				console.error(error);
			});
		}
	}
}
</script>

<style lang="sass" scoped>
#base
	display: flex
	align-items: center
	flex-wrap: wrap
	flex-direction: column
	.images-wrapper
		max-width: 1024px
		flex-basis: 1024px
		margin-left: 1rem
		box-sizing: border-box
		.navigation-buttons
			text-align: center
			button
				padding: 5px 10px
				border-radius: 3px
				background-color: #2de58c
				color: #FFF
				box-shadow: 0 0 3px rgba(45, 229, 140, .4)
				border: none
				font-size: 1rem
				font-family: sans-serif
				margin: .5rem
				width: 100px
				transition: background .3s
				&:hover
					cursor: pointer
					background-color: darken(#2de58c, 15)
		.images
			display: flex
			flex-wrap: wrap
			justify-content: space-around
	.search-wrapper
		margin-bottom: 1rem
		label
			font-family: sans-serif
		input, textarea
			margin: auto
			padding: 4px 8px
			width: 300px
			font-size: 14px
			border: 1px solid #CCC
			border-radius: 3px
			outline: #4ACFFF auto 0
			margin-bottom: .5rem
			&:focus
				border-color: #4ACFFF
				outline: #4ACFFF auto 5px
		textarea
			height: 36px
			resize: vertical
		select
			cursor: pointer
			margin: auto
			padding: 4px 8px
			font-size: 14px
			border: 1px solid #CCC
			border-radius: 3px
			outline: #4ACFFF auto 0
			margin-bottom: .5rem
			&:focus
				border-color: #4ACFFF
				outline: #4ACFFF auto 5px
			option
				font-size: 14px
		.button-wrapper
			text-align: center
			button
				padding: 5px 10px
				cursor: pointer
				font-size: 16px
				color: #FFF
				background-color: #4ACFFF
				box-shadow: 0 0 3px rgba(#4ACFFF, .4)
				border: none
				border-radius: 3px
				transition: background .3s
				&:hover, &:focus
					background: darken(#4ACFFF, 15)

</style>
