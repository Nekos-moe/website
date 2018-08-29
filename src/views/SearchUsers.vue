<template>
<div id="search-users">
	<div class="search">
		<b-field label="Username or ID">
			<b-input icon="account" v-model="search"></b-input>
		</b-field>
		<button class="submit button is-primary" @click="getResults(true)"><b-icon icon="magnify"></b-icon>Search</button>
	</div>
	<div class="no-results" v-show="users.length === 0">
		<b-message v-show="firstSearch" type="is-primary">Type a username or search all users.</b-message>
		<b-message v-show="!firstSearch" type="is-primary">No users matched your search.</b-message>
	</div>
	<div class="results" v-show="users.length !== 0">
		<div class="user-grid-wrapper">
			<div class="pagination-wrapper top">
				<b-pagination
					:total="hitEnd ? users.length : users.length + 1"
					:current="page"
					order="is-centered"
					:per-page="1"
					@change="changePage">
				</b-pagination>
			</div>
			<transition-group name="fade">
				<div class="page" v-for="(_page, i) of users" :key="i" v-if="page === i + 1">
					<div class="columns is-multiline is-centered">
						<div class="column is-one-third" v-for="(user, i2) of _page" :key="i2">
							<div class="card">
								<div class="card-content">
									<div class="media">
										<div class="media-left">
											<figure class="image is-48x48">
												<img class="avatar" :src="user.avatar || require('@/../static/images/404.jpg')">
											</figure>
										</div>
										<div class="media-content">
											<p class="title is-5"><router-link :to="'/user/' + user.id">{{ user.username }}</router-link></p>
											<p class="subtitle is-6">Joined <timeago :since="user.createdAt"></timeago></p>
										</div>
									</div>
									<p class="stats"><b-icon icon="cloud-upload"></b-icon> {{ user.uploads | humanize }} <b-icon icon="heart" type="is-danger"></b-icon> {{ user.favoritesReceived | humanize }} <b-icon icon="thumb-up" type="is-info"></b-icon> {{ user.likesReceived | humanize }}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</transition-group>
			<div class="pagination-wrapper bottom">
				<b-pagination
					:total="hitEnd ? users.length : users.length + 1"
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
			users: [],
			page: 1,
			search: '',
			hitEnd: false,
			firstSearch: true
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
				if (this.users.length !== 0 && this.users.length % 3 === 0 && this.users[this.users.length - 1].length % 9 === 0 && this.users.length <= page)
					await this.getResults(false);
				else if (page >= this.users.length)
					this.hitEnd = true
			}
			this.page = page;
		},
		async getResults(isNew = false) {
			this.$Progress.start();

			this.firstSearch = false;

			try {
				let response = await this.$http.post(API_BASE_URL + 'users/search', {
					limit: 60,
					skip: !isNew && this.page !== 1 ? this.page * 30 : 0,
					query: this.search
				}, {
					responseType: 'json',
					headers: { 'Authorization': localStorage.getItem('token') }
				});

				if (isNew) {
					this.page = 1;
					this.users = [];
					this.hitEnd = false;
				}

				if (response.data.users.length === 0)
					this.hitEnd = true;
				else {
					while (response.data.users.length > 0)
						this.users.push(response.data.users.splice(0, 30));

					if (this.users[this.users.length - 1].length !== 30)
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
	}
}
</script>

<style lang="sass">
#search-users
	margin: 30px 0
	.search
		margin: 0 auto
		max-width: 400px
		.button .icon:first-child:last-child
			margin-left: 0
			margin-right: 6px
		.button.submit
			width: 100%
			margin: 10px 0 30px
	.no-results
		margin: 0 auto
		padding-top: 12px
		article
			max-width: 400px
			margin: auto
	.results .user-grid-wrapper
		.pagination-wrapper
			margin: auto
			max-width: 390px
			&.top
				margin: 16px auto
			&.bottom
				margin-top: 16px
		.page
			margin: 10px 30px
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
						.stats
							text-align: center
							.icon
								vertical-align: sub
								&:not(.first-of-type)
								margin: 0 5px 0 30px
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
