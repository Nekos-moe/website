<template>
<body>
	<div id="base-how-to-upload">
		<h3>Uploading Guidelines</h3>
		<h5>Images</h5>
		<p>
			<strong>Quality:</strong> All uploads must be the source image. Compressed versions will be denied.
			<ul>
				<li><strong>If an image is too large for uploading:</strong> You may re-save it as a high quality JPG (quality: ~97) and scale it down to our maximum dimensions of 2000px if needed.</li>
				<li><strong>If the source is compressed or low-quality:</strong> You may use <a href="https://github.com/lltcggie/waifu2x-caffe/releases" target="_blank">waifu2x</a> to get it to an acceptable state.</li>
			</ul>
		</p>
		<p>
			<strong>Low Effort Images:</strong> Nekos.moe is intended to be a collection of high-quality images. Do not upload simple sketches or low effort drawings.
		</p>
		<p>
			<strong>Content:</strong> Nekos.moe is a website for images of characters with animal-like appearances. You may not upload images where characters do not have animal ears or an animal tail. The subject of the image must fit this requirement. For example, an image with multiple characters where only one fits this requirement is not allowed.
		</p>
		<p>
			<strong>3D:</strong> Images of real people (or your cat) are not allowed. Unfortunately, cat girls do not exist yet in real life.
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
		<p>
			<strong>Self-uploads:</strong> Uploading your own artwork is generally not allowed. Nekos.moe is a place for people to share images they consider above-average. If you're uploading your own art you may have a biased view of it. There are plenty of other sites you can upload your personal work to.
		</p>

		<h5>Tags</h5>
		<p>Nekos.moe uses a tagging system similar to the one used by Danbooru. We use the same tags, but we use spaces instead.</p>
		<p>
			<strong>Help:</strong> If you need help tagging posts then read <a href="https://danbooru.donmai.us/wiki_pages/11292" target="_blank">howto:tag</a> and <a href="https://danbooru.donmai.us/wiki_pages/21977" target="_blank">howto:tag checklist</a>
		</p>
		<p>
			<strong>Required:</strong> All posts are required to have tags to make them easily searchable.
		</p>
		<p>
			<strong>Format:</strong> Unlike other sites, all tags use spaces. To separate tags use a comma. New lines and extra spaces around tags will be removed.
		</p>
		<p>
			<strong>Copyrights and Characters:</strong> The copyrights and characters in a post should be tagged.
		</p>
		<p>
			<strong>Artist:</strong> All posts should have their artist tagged. For help formatting an artist's name see <a href="https://danbooru.donmai.us/wiki_pages/15486" target="_blank">howto:artist</a>.
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
		margin-top: 10px
	ul
		list-style: disc
		padding-left: 20px

</style>
