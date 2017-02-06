<style lang="sass" scoped>
	.nav-wrap
		font-family: sans-serif
		background-color: #2de58c
		box-shadow: 0 0 3px rgba(45, 229, 140, .2)
		padding: 0 1rem
		border-radius: .25rem
		a
			font-size: 1.5rem
			color: rgba(255, 255, 255, .75)
			text-decoration: none
			transition: color .2s
			margin: 0 .5rem
			padding: .5rem 1rem
			&.router-link-active
				color: #FFF
			&.brand
				float: left
				position: fixed
				color: #FFF
				font-weight: bold
			&:hover
				color: #FFF
		.nav
			display: flex
			flex-wrap: nowrap
			justify-content: center
</style>

<template lang="html">
	<div class="nav-wrap">
		<router-link to="/" exact class="brand">Catgirls</router-link>
		<div class="nav">
			<slot></slot>
		</div>
	</div>
</tamplate>
