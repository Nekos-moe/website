<template>
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
			<button type="button" @click="getResults(true)">Search</button>
		</div>
	</div>
	<div class="images-wrapper">
		<div class="navigation-buttons">
			<button @click="previous">Previous</button>
			<button @click="next">Next</button>
		</div>
		<!-- Todo: Show match score -->
		<div class="images">
			<transition-group name="slide-in">
				<div class="image-page" v-for="(im, i) of images" v-show="i === page - 1" v-if="Math.abs(i - (page - 1)) < 2" :key="i">
					<image-preview v-for="image of im" :image="image" :key="image.id"></image-preview>
				</div>
			</transition-group>
		</div>
		<div class="navigation-buttons">
			<button @click="previous">Previous</button>
			<button @click="next">Next</button>
		</div>
	</div>
</div>
</template>

<script>
import Vue from 'vue';

export default {
	data() {
		return {
			IMAGE_BASE_URL,
			images: [],
			page: 1,
			direction: 'right'
		};
	},
	computed: {
		user() {
			return this.$store.state.user
		}
	},
	methods: {
		previous() {
			if (this.page !== 1) {
				this.direction = 'left';
				this.page--;
			}
		},
		next() {
			if (this.page < this.images.length) {
				this.direction = 'right';
				this.page++;
			} else if (this.images.length !== 0 && this.images.length % 3 === 0 && this.images[this.images.length - 1].length % 9 === 0 && this.images.length === this.page) {
				this.getResults(false);
				this.direction = 'right';
				this.page++;
			}
		},
		async getResults(isNew = false) {
			this.$Progress.start();
			let tags = document.getElementById('tags').value,
				nsfw = {
					'undefined': undefined,
					'false': false,
					'true': true
				}[document.getElementById('nsfw').value],
				blacklist = this.$store.getters.blacklist;

			try {
				let response = await this.$http.post(API_BASE_URL + 'images/search', {
					nsfw,
					limit: 27,
					skip: !isNew && this.page !== 1 ? this.page * 9 : 0,
					tags: tags
						? tags + (blacklist ? ' ' + blacklist : '')
						: this.$store.getters.blacklist,
					sort: document.getElementById('sort').value,
					artist: document.getElementById('artist').value,
					uploader: document.getElementById('uploader').value
				}, {
					responseType: 'json',
					headers: { 'Authorization': localStorage.getItem('token') }
				});

				if (isNew) {
					this.page = 1;
					this.images = [];
					while (response.data.images.length > 0)
						this.images.push(response.data.images.splice(0, 9));
				} else {
					while (response.data.images.length > 0)
						this.images.push(response.data.images.splice(0, 9));
				}

				this.$Progress.finish();

				return response;
			} catch (error) {
				this.$Progress.fail();
				console.error(error);
				this.$parent.$data.modalData = {
					title: 'Request Error',
					body: error.response && error.response.data.message || error.message,
					type: 'error'
				};
				return;
			}
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
		width: 100%
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
		.image-page
			display: flex
			flex-wrap: wrap
			justify-content: space-around
			&.slide-in-leave-active > div
				animation: slide-out-bck-center 0.4s cubic-bezier(0.550, 0.085, 0.680, 0.530) both

		// Once other element leaves, enter new element
		.image-page:not(.slide-in-leave-active) + .image-page, .image-page:first-of-type
			div
				animation: slide-in-fwd-center 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both

		// Hide entering element until other leaves
		.slide-in-leave-active + .image-page, .image-page + .slide-in-leave-active
			display: none
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
