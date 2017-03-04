<template>
<div class="image-preview-wrap">
	<img :src="url" alt="">
	<router-link :to="'/post/' + image.id">
		<p><strong>Uploaded by</strong> {{ image.uploader.username }}</p>
		<p v-if="image.artist"><strong>Artist:</strong> {{ image.artist }}</p>
		<p><strong>Tags:</strong> {{ image.tags.replace(/,/g, ', ') }}</p>
		<p><strong>Favorites:</strong> {{ image.favorites | humanize }}</p>
		<p><strong>Likes:</strong> {{ image.likes | humanize }}</p>
		<p><strong>Uploaded on:</strong> {{ new Date(image.createdAt).toLocaleString() }}</p>
	</router-link>
</div>
</template>

<script>
export default {
	props: ['image'],
	computed: {
		url() {
			return IMAGE_BASE_URL + this.image.id
		}
	}
}
</script>

<style lang="sass">
.image-preview-wrap
	position: relative
	margin: .3rem 0
	width: 32%
	max-height: 420px
	border-radius: 2px
	display: flex
	justify-content: center
	align-items: center
	img
		max-height: 100%
		max-width: 100%
	a
		position: absolute
		top: 0
		left: 0
		width: 100%
		height: 100%
		border-radius: 2px
		transition: background-color .5s ease-in-out
		background-color: rgba(0, 0, 0, 0)
		text-decoration: none
		overflow-y: hidden
		&:hover
			background-color: rgba(0, 0, 0, .6)
			p
				opacity: 1
		p
			padding: 0 1rem
			opacity: 0
			transition: opacity .5s ease-in-out
			font-family: monospace
			font-size: 14px
			color: #EEE
			& ~ p
				margin-top: .5rem
			strong
				font-family: 'Nunito', sans-serif
</style>
