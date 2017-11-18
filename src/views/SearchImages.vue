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
	<div class="results">
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
							<div class="card" :id="'post-' + post.id">
								<div class="card-image">
									<figure class="image">
										<img :src="THUMBNAIL_BASE_URL + post.id">
									</figure>
								</div>
								<div class="card-content">
									<div class="media">
										<div class="media-left">
											<figure class="image is-48x48">
												<img class="avatar" :src="user.avatar || require('@/../assets/images/404.jpg')">
											</figure>
										</div>
										<div class="media-content">
											<p class="title is-5"><router-link :to="'/user/' + post.uploader.id" :class="{ 'has-text-danger': post.nsfw }">{{ post.uploader.username }}</router-link></p>
											<p class="subtitle is-6">{{ new Date(post.createdAt).toLocaleString() }}</p>
										</div>
									</div>

									<p>Artist: {{ post.artist || 'Unknown' }}</p>
									<b-tag v-for="(tag, i) of post.tags.slice(0, 12)" :key="i" :type="post.nsfw ? 'is-danger' : 'is-primary'">{{ tag }}</b-tag>
									<b-tag v-if="post.tags.length > 12" class="tag-more" :type="post.nsfw ? 'is-danger' : 'is-primary'">+ {{post.tags.length - 12}} more</b-tag>
								</div>
								<footer class="card-footer">
									<router-link class="card-footer-item" :to="'/post/' + post.id">View</router-link>
									<a v-if="loggedIn" @click="like(post.id)" class="card-footer-item has-text-success">{{ user.likes.includes(post.id) ? 'Unlike' : 'Like' }}</a>
									<a v-if="loggedIn" @click="like(post.id, 'favorites')" class="card-footer-item has-text-danger">{{ user.favorites.includes(post.id) ? 'Unfavorite' : 'Favorite' }}</a>
								</footer>
							</div>
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
			hitEnd: false
		};
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
		},
		async like(id, type = 'likes') {
			try {
				await this.$http.patch(`${API_BASE_URL}image/${id}/relationship`, {
					type: type.slice(0, -1),
					create: !this.user[type].includes(id)
				}, { headers: { 'Authorization': localStorage.getItem('token') } });

				if (this.user[type].includes(id))
					this.user[type].splice(this.user[type].indexOf(id), 1);
				else
					this.user[type].push(id);
			} catch (error) {
				console.error(error);
				return this.$dialog.alert({
					type: 'is-danger',
					title: 'Error updating image relationship',
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
			margin: 28px 0 20px
		textarea
			resize: none
	.results
		.post-grid-wrapper
			.pagination-wrapper
				margin: auto
				max-width: 390px
				&.top
					margin: 16px auto
				&.bottom
					margin-top: 16px
			.page
				.columns
					.column
						margin: auto 0
						.card-image
							img
								max-height: 420px
								width: auto
								margin: 0 auto
						.card-content
							padding: 1rem
							.avatar
								border-radius: 2px
							.tag
								margin: 2px
								& + div.field
									margin-top: 12px
							.tag-more
								margin-left: -2px
						footer
							margin: 0
							font-weight: bold
		.fade-enter-active, .fade-leave-active
			transition: opacity .2s ease-in-out both
		.fade-enter, .fade-leave-to
			opacity: 0

		// IDK why this works, but if you remove it then changing page brings you back to the top
		fade-enter-active + .page, .page + .fade-enter-active
			display: none
</style>
