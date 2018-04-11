<template>
<body>
	<div id="base-how-to-upload">
		<h3>Uploading Guidelines</h3>
		<h5>Images</h5>
		<p>
			<strong>Quality:</strong> You should avoid uploading images where compression is obvious.
			If you can't find a better upload online, use <a href="https://github.com/lltcggie/waifu2x-caffe/releases" target="_blank">waifu2x</a> to de-noise it.
		</p>
		<p>
			<strong>Low Effort Images:</strong> Nekos.moe is intended to be a collection of high-quality images. Do not upload simple or low effort drawings. Examples include sketches, WIP images, and self-posts when learning to draw.
		</p>
		<p>
			<strong>Content:</strong> This is a site mainly for cat girls, but other related images such as fox girls are allowed.
			Do not upload normal images or they will be removed.
		</p>
		<p>
			<strong>3D:</strong> Images of real people (or your cat) are not allowed. Unfortunately, cat girls do not exist in real life yet.
		</p>
		<p>
			<strong>Spoilers:</strong> Images containing spoilers should not be uploaded. Repeated violations of this rule will result in a ban.
		</p>
		<p>
			<strong>Adult Content:</strong> You are allowed to upload images containing <u>moderate</u> amounts of sexual content.
			These are referred to as "NSFW" (Not Safe for Work).
			If you are not sure if an image should be labeled as "NSFW", then it should.<br><!--
			-->Any account that uploads sexual content of minors (a.k.a. lolis) will be banned.
		</p>
		<h5>Tags</h5>
		<p>
			<strong>Required:</strong> All posts are required to have tags to make them easily searchable.
			When adding tags, follow the format used on other posts. Do not include irrelevant tags.
		</p>
		<p>
			<strong>Format:</strong> Unlike other sites, all tags use spaces. The characters - and _ are replaced.
			To input multiple tags separate them with a comma. New lines and extra spaces around tags will be removed.
		</p>
		<p>
			<strong>Source and character(s):</strong> Including the source and characters in the tags is optional, but strongly encouraged.
		</p>
	</div>
</body>
</template>

<script>
export default {
	data() {
		return { };
	}
}
</script>

<style lang="sass">
#base-how-to-upload
	margin: 40px auto
	width: 80%
	min-width: 300px
	color: #222
	font-family: 'Nunito', sans-serif
	h3
		font-size: 2.5rem
		margin: 2rem
		text-align: center
	h5
		font-size: 1.5rem
		margin-top: 3rem
		margin-bottom: 1rem
		margin-left: 3rem
	p + p
		margin-top: 6px
</style>
