<template>
<div id="base-images">
	<div class="search-wrapper">
		<Form ref="options" :model="options" label-position="top">
			<Form-item label="Tags" label-position="top">
				<Input v-model="options.tags" type="textarea" placeholder="Tags" :rows="3"></Input>
			</Form-item>
			<Form-item label="NSFW Results">
				<Select v-model="options.nsfw">
					<Option value="undefined">Show me everything</Option>
					<Option value="true">Only NSFW</Option>
					<Option value="false" selected>Block NSFW</Option>
				</Select>
			</Form-item>
			<Form-item label="Sort">
				<Select v-model="options.sort">
					<Option value="newest" selected>Newest</Option>
					<Option value="oldest">Oldest</Option>
					<Option value="likes">Likes</Option>
				</Select>
			</Form-item>
			<Form-item label="Uploaded After">
				<Date-picker class="wide" v-model="options.after" type="date" placement="bottom"  format="MMMM Do, yyyy"></Date-picker>
			</Form-item>
			<Form-item label="Uploaded Before">
				<Date-picker class="wide" v-model="options.before" type="date" placement="bottom" format="MMMM Do, yyyy"></Date-picker>
			</Form-item>
			<Form-item label="Artist">
				<Input v-model="options.artist" placeholder="Artist" icon="paintbrush"></Input>
			</Form-item>
			<Form-item label="Uploader">
				<Input v-model="options.uploader" placeholder="Uploader" icon="person"></Input>
			</Form-item>
			<Button type="success" @click="getResults(true)" long>Search</Button>
		</Form>
	</div>
	<div class="images-wrapper">
		<div class="page-wrapper">
			<Page class-name="page" :current="page" :page-size="1" :total="hitEnd ? images.length : images.length + 1" @on-change="changePage"></Page>
		</div>
		<!-- Todo: Show match score -->
		<div class="images">
			<transition-group name="slide-in">
				<div class="image-page" v-for="(im, i) of images" v-show="i === page - 1" v-if="Math.abs(i - (page - 1)) < 2" :key="i">
					<image-preview v-for="image of im" :image="image" :key="image.id"></image-preview>
				</div>
			</transition-group>
		</div>
		<div class="page-wrapper">
			<Page class-name="page" :current="page" :page-size="1" :total="hitEnd ? images.length : images.length + 1" @on-change="changePage"></Page>
		</div>
	</div>
</div>
</template>

<script>
export default {
	data() {
		return {
			images: [],
			page: 1,
			direction: 'right',
			options: {
				tags: '',
				nsfw: 'false',
				sort: 'newest',
				after: null,
				before: null,
				artist: '',
				uploader: '',
			},
			hitEnd: false
		};
	},
	computed: {
		user() {
			return this.$store.state.user;
		}
	},
	methods: {
		async changePage(page) {
			if (page > this.page) {
				if (this.images.length !== 0 && this.images.length % 3 === 0 && this.images[this.images.length - 1].length % 9 === 0 && this.images.length <= page)
					await this.getResults(false);
				else if (page >= this.images.length)
					this.hitEnd = true
			}
			this.page = page;
		},
		async getResults(isNew = false) {
			this.$Progress.start();

			let nsfw = {
					'undefined': undefined,
					'false': false,
					'true': true
				}[this.options.nsfw],
				blacklist = this.$store.getters.blacklist;

			try {
				let response = await this.$http.post(API_BASE_URL + 'images/search', {
					nsfw,
					limit: 27,
					skip: !isNew && this.page !== 1 ? (this.page + 1) * 9 : 0,
					tags: this.options.tags
						? this.options.tags + (blacklist ? ' ' + blacklist : '')
						: blacklist,
					posted_after: this.options.after ? this.options.after.valueOf() : undefined,
					posted_before: this.options.before ? this.options.before.valueOf() : undefined,
					sort: this.options.sort,
					artist: this.options.artist,
					uploader: this.options.uploader
				}, {
					responseType: 'json',
					headers: { 'Authorization': localStorage.getItem('token') }
				});

				if (isNew) {
					this.page = 1;
					this.images = [];
					this.hitEnd = false;
				}

				if (response.data.images.length === 0)
					this.hitEnd = true;
				else {
					while (response.data.images.length > 0)
						this.images.push(response.data.images.splice(0, 9));

					if (this.images[this.images.length - 1].length !== 9)
						this.hitEnd = true;
				}

				this.$Progress.finish();

				return response;
			} catch (error) {
				this.$Progress.fail();
				console.error(error);
				this.$Modal.error({
					title: 'Error Performing Search',
					content: error ? error.response && error.response.data.message || error.message : 'Unknown Error'
				});
				return;
			}
		}
	},
	beforeMount() {
		if (this.$store.getters.NSFWImages === true)
			this.options.nsfw = 'undefined';
	}
}
</script>

<style lang="sass">
#base-images
	display: flex
	align-items: flex-start
	flex-wrap: wrap
	flex-direction: row
	justify-content: center
	.images-wrapper
		max-width: 1024px
		width: calc(100% / 4 * 3)
		box-sizing: border-box
		padding-left: 20px
		.page-wrapper
			text-align: center
			.page
				display: inline-block
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
		width: calc(100% / 4)
		max-width: 400px
		margin-bottom: 1rem
		.wide
			width: 100%
</style>
