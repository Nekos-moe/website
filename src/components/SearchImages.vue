<template>
<body>
	<div id="base">
		<div class="search-wrapper">
			<input type="text" id="tags" value="" placeholder="Tags" @change="getResults">
			<button type="button" @click="getResults">Search</button>
		</div>
		<div class="images-wrapper">
			<div class="navigation-buttons">
				<button @click="previous">Previous</button>
				<button @click="next">Next</button>
			</div>
			<!-- Todo: Show match score -->
			<div class="images">
				<div v-for="(image, index) of images" v-show="~~(index / 9) === page - 1">
					<img :src="IMAGE_BASE_URL + image.id">
				</div>
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
			let tags = document.getElementById('tags').value;

			if (tags === '')
				return;

			this.$http.post(API_BASE_URL + 'images/search', { tags }, {
				responseType: 'json',
				headers: {
					'Authorization': localStorage.getItem('token')
				}
			}).then(response => {
				this.images = response.data.images;
			}).catch(console.error);
		}
	}
}
</script>

<style lang="sass" scoped>
#base
	.images-wrapper
		box-sizing: border-box
		.navigation-buttons
			text-align: center
			button
				padding: 5px 10px
				border-radius: 3px
				background-color: #2de58c
				color: #FFF
				box-shadow: 0 0 3px rgba(45, 229, 140, .2)
				border: none
				font-size: 1rem
				font-family: sans-serif
				margin: .5rem
				&:hover
					cursor: pointer
		.images
			display: flex
			flex-wrap: wrap
			justify-content: space-around
			div
				display: flex
				justify-content: center
				align-items: center
				align-self: center
				margin: .3rem 0
				//height: 400px
				width: 30%
				img
					max-height: 100%
					max-width: 100%

</style>
