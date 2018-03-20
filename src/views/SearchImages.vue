<template>
<div id="base-images">
	<div class="columns search-wrapper">
		<div class="column is-one-third">
			<b-field label="Tags">
				<b-input type="textarea" v-model="options.tags" placeholder="cat ears, tail, paw pose"></b-input>
			</b-field>
			<button class="submit button is-primary" @click="getResults(true)"><b-icon icon="magnify"></b-icon>Search</button>
		</div>
		<div class="column is-one-third">
			<b-field label="Sort">
				<b-select v-model="options.sort" placeholder="Sort order" expanded icon="sort">
					<option value="newest" selected>New</option>
					<option value="oldest">Old</option>
					<option value="likes">Likes</option>
				</b-select>
			</b-field>
			<b-field label="NSFW">
				<b-select v-model="options.nsfw" placeholder="Include NSFW results?" expanded icon="minus-circle">
					<option value="undefined">Show me everything</option>
					<option value="true">Only NSFW</option>
					<option value="false" selected>Block NSFW</option>
				</b-select>
			</b-field>
			<b-field label="Artist">
				<b-input icon="brush" v-model="options.artist"></b-input>
			</b-field>
		</div>
		<div class="column is-one-third">
			<b-field label="Uploaded After">
				<b-datepicker v-model="options.after" :max-date="options.before" placeholder="Click to select..." icon="calendar">
					<button class="button is-small is-primary" @click="options.after = new Date()">
						<b-icon size="is-small" icon="calendar-today"></b-icon>
						<span>Today</span>
					</button>
					<button class="button is-small is-danger" @click="options.after = null">
						<b-icon size="is-small" icon="close"></b-icon>
						<span>Clear</span>
					</button>
				</b-datepicker>
			</b-field>
			<b-field label="Uploaded Before">
				<b-datepicker v-model="options.before" :min-date="options.after" placeholder="Click to select..." icon="calendar">
					<button class="button is-small is-primary" @click="options.before = new Date()">
						<b-icon size="is-small" icon="calendar-today"></b-icon>
						<span>Today</span>
					</button>
					<button class="button is-small is-danger" @click="options.before = null">
						<b-icon size="is-small" icon="close"></b-icon>
						<span>Clear</span>
					</button>
				</b-datepicker>
			</b-field>
			<b-field label="Uploader">
				<b-input icon="account" v-model="options.uploader"></b-input>
			</b-field>
		</div>
	</div>
	<hr>
	<div class="no-results" v-show="!firstSearch && posts.length === 0">
		<b-message type="is-primary">No posts matched your search. Try providing broader search parameters.</b-message>
	</div>
	<div class="results" v-show="posts.length !== 0">
		<div class="post-grid-wrapper">
			<div class="pagination-wrapper top">
				<b-pagination
					:total="hitEnd ? posts.length : posts.length + 1"
					:current="page"
					order="is-centered"
					:per-page="1"
					@change="changePage">
				</b-pagination>
			</div>
			<transition-group name="fade">
				<div class="page" v-for="(_page, i) of posts" :key="i" v-if="page === i + 1">
					<div class="columns is-multiline is-centered">
						<div class="column is-one-third" v-for="(post, i2) of _page" :key="i2">
							<post-card :post="post" />
						</div>
					</div>
				</div>
			</transition-group>
			<div class="pagination-wrapper bottom">
				<b-pagination
					:total="hitEnd ? posts.length : posts.length + 1"
					:current="page"
					order="is-centered"
					:per-page="1"
					@change="changePage">
				</b-pagination>
			</div>
		</div>
	</div>
</div>
</template>

<script>
import PostCard from '@/components/PostCard';

export default {
	data() {
		return {
			THUMBNAIL_BASE_URL,
			posts: [],
			page: 1,
			options: {
				tags: '',
				nsfw: 'false',
				sort: 'newest',
				after: null,
				before: null,
				artist: '',
				uploader: '',
			},
			hitEnd: false,
			firstSearch: true
		};
	},
	components: {
		PostCard
	},
	computed: {
		user() {
			return this.$store.state.user;
		},
		loggedIn() {
			return this.$store.state.loggedIn;
		}
	},
	methods: {
		async changePage(page) {
			if (page > this.page) {
				if (this.posts.length !== 0 && this.posts.length % 3 === 0 && this.posts[this.posts.length - 1].length % 9 === 0 && this.posts.length <= page)
					await this.getResults(false);
				else if (page >= this.posts.length)
					this.hitEnd = true
			}
			this.page = page;
		},
		async getResults(isNew = false) {
			this.$Progress.start();

			this.firstSearch = false;

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
					skip: !isNew ? this.posts.length * 9 : 0,
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
					this.posts = [];
					this.hitEnd = false;
				}

				if (response.data.images.length === 0)
					this.hitEnd = true;
				else {
					while (response.data.images.length > 0)
						this.posts.push(response.data.images.splice(0, 9));

					if (this.posts[this.posts.length - 1].length !== 9)
						this.hitEnd = true;
				}

				this.$Progress.finish();

				return response;
			} catch (error) {
				this.$Progress.fail();
				console.error(error);
				return this.$dialog.alert({
					type: 'is-danger',
					title: 'Error performing search',
					message: error ? error.response && error.response.data.message || error.message : 'Unknown Error',
					hasIcon: true
				});
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
	.search-wrapper
		.button .icon:first-child:last-child
			margin-left: 0
			margin-right: 6px
		.button.submit
			width: 100%
			margin: 28px 0 0
		textarea
			resize: none
	hr
		margin: 20px 0
		border-top: 1px solid #dbdbdb
	.no-results
		margin: 0 auto
		padding-top: 12px
		article
			max-width: 400px
			margin: auto
	.results
		padding-top: 12px
		.post-grid-wrapper
			.pagination-wrapper
				margin: auto
				max-width: 390px
				&.top
					margin-bottom: 16px
				&.bottom
					margin-top: 16px
			.page .columns .column
				margin: auto 0
		.fade-enter-active, .fade-leave-active
			transition: opacity .2s ease-in-out both
		.fade-enter, .fade-leave-to
			opacity: 0

		// IDK why this works, but if you remove it then changing page brings you back to the top
		.fade-enter-active + .page, .page + .fade-enter-active
			display: none
</style>
