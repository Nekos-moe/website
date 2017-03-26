<template>
<div class="modal-wrap">
	<div class="header" :class="{ warning: data.type === 'warning', error: data.type === 'error' }"></div>
	<div class="modal">
		<h4 v-if="data.title">{{ data.title }}</h4>
		<p v-if="data.body" v-html="data.body"></p>
		<router-link v-if="data.link" :to="data.link" @click="close">{{ data.linkText || 'View' }}</router-link>
		<button v-if="data.buttons" v-for="button of data.buttons" @click="close" :class="{ warning: button.type === 'warning', error: button.type === 'error' }">{{ button.text }}</button>
		<button v-if="!data.buttons" @click="close" :class="{ warning: data.type === 'warning', error: data.type === 'error' }">{{ data.button || 'Ok' }}</button>
	</div>
</div>
</template>

<script>
export default {
	props: ['data'],
	methods: {
		close(e) {
			if (this.data.callback)
				this.data.callback(e);

			this.$parent.$data.modalData = null;
		}
	},
	watch: {
		'$route': 'close'
	}
}
</script>

<style lang="sass" scoped>
.modal-wrap
	position: fixed
	left: 0
	top: 0
	width: 100%
	height: 100%
	z-index: 100
	display: flex
	justify-content: center
	align-items: center
	flex-direction: column
	background-color: rgba(0, 0, 0, .3)
	.modal
		display: block
		padding: 15px 25px
		background-color: #FFF
		border-radius: 0 0 .25rem .25rem
		box-shadow: 1px 2px 5px rgba(0, 0, 0, .4)
		width: 40%
		color: #222
		font-family: 'Nunito', sans-serif
		text-align: center
		a
			text-decoration: none
			&:hover, &:active, &:focus
				color: #FFF
		button + button, a + button
			margin-left: 1rem !important
		h4
			text-align: center
			font-size: 2rem
			margin: 1rem
			margin-top: 0
		button, a
			margin: auto
			margin-top: .5rem
			padding: 5px 10px
			cursor: pointer
			font-family: 'Nunito', sans-serif
			font-size: 1.25rem
			color: #FFF
			background-color: #2DE58C
			box-shadow: 0 0 3px rgba(#2DE58C, .4)
			border: none
			border-radius: 3px
			transition: background .3s
			&:hover, &:focus
				background: darken(#2DE58C, 15)
			&.warning
				background-color: #FDD835
				&:hover, &:focus
					background: darken(#FDD835, 15)
			&.error
				background-color: #E53935
				&:hover, &:focus
					background: darken(#E53935, 15)
	.header
		display: block
		border-radius: .25rem .25rem 0 0
		background-color: #2de58c
		height: 30px
		width: 40%
		padding: 0 25px
		box-shadow: 1px 2px 5px rgba(0, 0, 0, .4)
		&.warning
			background-color: #FDD835
		&.error
			background-color: #E53935

</style>
