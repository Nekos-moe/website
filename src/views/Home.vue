<template>
<div id="base-home">
	<div class="grid-item left">
		<div class="welcome">
			<p class="header">Welcome to Nekos.moe! <b-tag class="beta" type="is-dark">Beta</b-tag></p>
			<p>Nekos.moe is a collection of high-quality images featuring characters with cat-like appearances.</p>
		</div>
		<!-- <div class="attention" v-if="loggedIn && !seenNotice('newDesign')">
			<b-message title="Site Updated" type="is-info" has-icon @close="ackNotice('newDesign')">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Incidunt ut eligendi laudantium mollitia, dolorum impedit cum exercitationem! Officiis, explicabo dolores minima asperiores, sequi, sit a eaque fugiat corrupti amet et.</b-message>
		</div> -->
		<div class="search">
			<p class="header">Explore Nekos</p>
			<b-input v-model="searchInput" expanded placeholder="Search by tags" icon="magnify" @keyup.enter.native="search"></b-input>
			<p class="trailer">Looking for something more specific? Try our <router-link to="/search/images">Advanced Search</router-link></p>
		</div>
		<div v-if="loggedIn && user.savedTags && user.savedTags.length > 0" class="container-images" id="recPosts">
			<div class="header">
				<p>Recommended Posts</p>
			</div>
			<div class="post-previews">
				 <img v-for="post of recPosts" :key="post.id" :src="THUMBNAIL_BASE_URL + post.id" :alt="post.id" @click="goToPost(post.id)">
			</div>
		</div>
		<div class="container-images" id="topPosts">
			<div class="header">
				<p>Top Posts</p>
			</div>
			<div class="post-previews">
				 <img v-for="post of topPosts" :key="post.id" :src="THUMBNAIL_BASE_URL + post.id" :alt="post.id" @click="goToPost(post.id)">
			</div>
			<div class="trailer">
				<router-link to="/search/images?sort=likes">View more...</router-link>
			</div>
		</div>
		<div class="container-images" id="newPosts">
			<div class="header">
				<p>New Posts</p>
			</div>
			<div class="post-previews">
				 <img v-for="post of newPosts" :key="post.id" :src="THUMBNAIL_BASE_URL + post.id" :alt="post.id" @click="goToPost(post.id)">
			</div>
			<div class="trailer">
				<router-link to="/search/images?sort=newest">View more...</router-link>
			</div>
		</div>
	</div>
	<div class="grid-item right">
		<div class="container-home" id="savedTags">
			<div class="header">
				<p>My Favorite Tags</p>
			</div>
			<div class="container-content">
				<ul v-if="loggedIn && user.savedTags && user.savedTags.length > 0" class="tag-list">
					<router-link v-for="tag of user.savedTags" :key="tag" :to="`/search/images?tags=\u0022${tag}\u0022`">{{ tag }}</router-link>
				</ul>
				<p v-else-if="loggedIn">You don't have any favorite tags. <router-link to="/settings">Add some on the settings page.</router-link></p>
				<p v-else>Create an account to favorite tags.</p>
			</div>
		</div>
		<div class="container-home" id="randomTags">
			<div class="header">
				<p>Explore Random Tags</p>
			</div>
			<div class="container-content">
				<ul class="tag-list">
					<router-link v-for="tag of tags" :key="tag" :to="`/search/images?tags=\u0022${tag}\u0022`">{{ tag }}</router-link>
				</ul>
			</div>
			<div class="container-footer">
				<router-link to="/search/images">Search everything...</router-link>
			</div>
		</div>
		<div class="container-home" id="discord">
			<div class="header">
				<p>Join us on Discord</p>
			</div>
			<div class="embed">
				<a href="https://discord.gg/Pk9YBTt">
					<img src="https://discordapp.com/api/guilds/416716547911057408/widget.png?style=banner3">
				</a>
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
			topPosts: [],
			newPosts: [],
			recPosts: [],
			searchInput: '',
			getRecs: true
		};
	},
	computed: {
		user() {
			return this.$store.state.user;
		},
		loggedIn() {
			return this.$store.state.loggedIn;
		},
		showNsfw() {
			return this.$store.getters.NSFWImages;
		},
		blacklist() {
			return this.$store.state.preferences.blacklist || [];
		},
		tags() {
			return this.randomElements((this.$store.state.tagCache || []).filter(tag => !this.blacklist.includes(tag)), 20);
		}
	},
	methods: {
		seenNotice(name) {
			return localStorage.getItem('lastNotice') === name;
		},
		ackNotice(name) {
			return localStorage.setItem('lastNotice', name);
		},
		goToPost(id) {
			return this.$router.push('/post/' + id);
		},
		randomElements(_array, length) {
			const array = _array.slice();
			const elements = [];

			for (let i = 0; i < length; i++) {
				const index = Math.random() * array.length | 0
				elements.push(array.splice(index, 1)[0]);
			}

			return elements;
		},
		getTags() {
			return this.$store.dispatch('getTags');
		},
		async getPosts() {
			try {
				const newResponse = await this.$http.post(API_BASE_URL + 'images/search', {
					sort: 'recent',
					limit: 8,
					nsfw: this.showNsfw === true ? undefined : false,
					tags: this.$store.getters.blacklist
				}, { responseType: 'json' });

				const topResponse = await this.$http.post(API_BASE_URL + 'images/search', {
					sort: 'top',
					limit: 8,
					skip: Math.random() * 20 | 0, // Skip a random amount
					nsfw: this.showNsfw === true ? undefined : false,
					tags: this.$store.getters.blacklist
				}, { responseType: 'json' });

				this.newPosts = newResponse.data.images;
				this.topPosts = topResponse.data.images;
				return;
			} catch (error) {
				console.error(error);
				return this.$dialog.alert({
					type: 'is-danger',
					title: 'Error getting posts',
					message: error ? error.response && error.response.data.message || error.message : 'Unknown Error',
					hasIcon: true
				});
			}
		},
		async getRecommendedPosts() {
			try {
				const blacklist = this.$store.getters.blacklist;
				const resp = await this.$http.post(API_BASE_URL + 'images/search', {
					sort: 'recent',
					limit: 8,
					nsfw: this.showNsfw === true ? undefined : false,
					tags: this.user.savedTags + (blacklist ? ', ' + blacklist : '')
				}, { responseType: 'json' });

				this.recPosts = resp.data.images;
				this.getRecs = false;
				return;
			} catch (error) {
				console.error(error);
				return this.$dialog.alert({
					type: 'is-danger',
					title: 'Error getting recommended posts',
					message: error ? error.response && error.response.data.message || error.message : 'Unknown Error',
					hasIcon: true
				});
			}
		},
		search() {
			return this.$router.push('/search/images?tags=' + this.searchInput);
		}
	},
	beforeMount() {
		this.getTags();
		this.getPosts();
		if (this.loggedIn && this.user.savedTags && this.user.savedTags.length > 0)
			this.getRecommendedPosts();
	},
	watch: {
		loggedIn() {
			if (this.user.savedTags && this.user.savedTags.length > 0 && this.getRecs)
				return this.getRecommendedPosts();
		}
	}
}
</script>

<style lang="sass">
#base-home
	.grid-item
		display: inline-block
		vertical-align: top
		&.left
			width: calc((1280px - 4rem) / 4 * 3 - 5px)
		&.right
			width: calc((1280px - 4rem) / 4 - 5px)

	.attention
		margin: 20px auto
		max-width: 720px

	.welcome
		padding: 10px
		p.header
			font-weight: 700
			font-size: 26px
			margin-bottom: 4px
			.beta
				position: relative
				top: -5px

	.container-home
		width: 100%
		padding: 10px
		.header
			border-bottom: 1px solid #ccc
			padding-bottom: 4px
			margin-bottom: 6px
			p
				font-weight: 700
				text-transform: uppercase
		.container-content
			ul
				font-size: 14px
		.container-footer
			margin-top: 6px
			a
				display: block
				text-align: right
				font-size: 14px
		.embed
			a
				display: block

	.container-images
		width: 100%
		margin-top: 20px
		padding: 10px
		.header
			border-bottom: 1px solid #ccc
			padding-bottom: 4px
			margin-bottom: 6px
			p
				font-weight: 700
				font-size: 22px
		.post-previews
			width: 100%
			max-height: calc(300px * 2 + 5px * 4)
			display: flex
			flex-wrap: wrap
			justify-content: center
			overflow: hidden
			img
				margin: 5px
				border-radius: 3px
				max-width: calc((100% - 10px * 3) / 3)
				max-height: 300px
				height: fit-content
				box-shadow: 0px 0px 5px #bbb
				align-self: center
				&:hover
					cursor: pointer
		.trailer
			border-top: 1px solid #ccc
			padding-top: 4px
			margin-top: 6px
			a
				display: block
				margin-right: 10px
				text-align: right
				font-size: 14px

	.search
		padding: 10px
		max-width: 800px
		.header
			padding-bottom: 4px
			font-weight: 700
			font-size: 26px
		.trailer
			padding-top: 2px
			font-size: 14px

	.tag-list
		list-style: none
		padding-left: 0
		a
			display: block
			color: #4a4a4a
</style>
