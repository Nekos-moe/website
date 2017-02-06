<style lang="sass" scoped>
#base
	display: flex
	.account-view
		box-sizing: border-box
		// max-width: 256px
		flex-basis: 256px
		padding: 1rem
		box-shadow: 0 0 3px #CCC
		border-radius: .25rem
		font-family: sans-serif
		.icon-text-wrapper
			display: table
			margin-bottom: .5rem
			img
				vertical-align: middle
			span
				display: table-cell
				vertical-align: middle
				padding-left: .5rem
			&:last-of-type
				margin-bottom: 0
		.user
			margin-bottom: 1rem
			overflow: hidden
			white-space: nowrap
			text-overflow: ellipsis
			.avatar-small
				width: 32px
				height: 32px
				vertical-align: middle
			.username
				font-size: 1.2rem
		.mess
			color: #5ee03a
		.like
			color: #47dced
		.fav
			color: #ed4778
	.images-wrapper
		box-sizing: border-box
		max-width: 1024px
		flex-basis: 1024px
		margin-left: 1rem
		display: flex
		flex-wrap: wrap
		justify-content: space-around
		div
			display: flex
			justify-content: center
			align-items: center
			align-self: center
			margin: .3rem
			height: 400px
			width: 300px
			img
				max-height: 100%
				max-width: 100%

</style>

<script>
import { recentImages } from '../store/api';

export default {
	data() {
		return {
			images: []
		};
	},
	computed: {
		user() {
			return this.$store.state.user
		}
	},
	methods: {
		getUser(e) {
			this.$store.commit('message', e.target.value);
		}
	},
	beforeMount() {
		recentImages(9).then(images => this.$data.images = images);
	}
}
</script>

<template>
	<div id="base">
		<div class="account-view">
			<div class="icon-text-wrapper user">
				<img :src="user.avatar" class="avatar-small">
				<span class="username">{{ user.username }}</span>
			</div>
			<div class="icon-text-wrapper mess">
				<img src="http://placehold.it/20x20">
				<span>{{ user.notifications | humanize }} Notifications</span>
			</div>
			<div class="icon-text-wrapper like">
				<img src="http://placehold.it/20x20">
				<span>{{ user.likes | humanize }} Likes</span>
			</div>
			<div class="icon-text-wrapper fav">
				<img src="http://placehold.it/20x20">
				<span>{{ user.favorites | humanize }} Favorites</span>
			</div>
		</div>
		<div class="images-wrapper">
			<div v-for="image of images">
				<img :src="image">
			</div>
		</div>
	</div>
</template>
