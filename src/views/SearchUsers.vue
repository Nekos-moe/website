<template>
<div id="search-users">
	<div class="search-wrapper">
		<Input v-model="search" placeholder="Username or ID"></Input>
		<Button type="success" @click="getResults(true)" long>Search</Button>
	</div>
	<div class="users-wrapper">
		<div class="page-wrapper">
			<Page class-name="page" :current="page" :page-size="1" :total="hitEnd ? users.length : users.length + 1" @on-change="changePage"></Page>
		</div>
		<div class="users">
			<transition-group name="slide-in">
				<div class="user-page" v-for="(u, i) of users" v-show="i === page - 1" v-if="Math.abs(i - (page - 1)) < 2" :key="i">
					<div class="user" v-for="user of u" :key="user.id">
						<img :src="user.avatar || require('@/../assets/images/404.jpg')">
						<router-link class="username" :to="'/user/' + user.id">{{ user.username }}</router-link>
						<Icon type="upload" size="20" title="Uploads" />
						<span class="uploads">{{ user.uploads | humanize }}</span>
						<Icon type="android-favorite" size="20" color="#ed4778" title="Favorites received" />
						<span class="favorites">{{ user.favoritesReceived | humanize }}</span>
						<Icon type="thumbsup" size="20" color="#47dced" title="Likes received" />
						<span class="likes">{{ user.likesReceived | humanize }}</span>
						<!-- FUTURE: Display roles like mod/admin -->
					</div>
				</div>
			</transition-group>
		</div>
		<div class="page-wrapper">
			<Page class-name="page" :current="page" :page-size="1" :total="hitEnd ? users.length : users.length + 1" @on-change="changePage"></Page>
		</div>
	</div>
</div>
</template>

<script>
export default {
	data() {
		return {
			IMAGE_BASE_URL,
			users: [],
			page: 1,
			direction: 'right',
			search: '',
			hitEnd: false
		};
	},
	computed: {
		user() {
			return this.$store.state.user;
		}
	},
	methods: {
		changePage(page) {
			if (page < this.page && page !== 1)
				this.direction = 'left';
			else if (page > this.page) {
				if (page < this.users.length)
					this.direction = 'right';
				else if (this.users.length !== 0 && this.users.length % 3 === 0 && this.users[this.users.length - 1].length % 20 === 0 && this.users.length === page) {
					this.page = page; // To make getResults work right
					this.getResults(false);
					this.direction = 'right';
				} else
					this.hitEnd = true
			}
			this.page = page;
		},
		async getResults(isNew = false) {
			this.$Progress.start();

			try {
				let response = await this.$http.post(API_BASE_URL + 'users/search', {
					limit: 60,
					skip: !isNew && this.page !== 1 ? this.page * 20 : 0,
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
						this.users.push(response.data.users.splice(0, 20));

					if (this.users[this.users.length - 1].length !== 20)
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
	}
}
</script>

<style lang="sass">
#search-users
	display: flex
	align-items: center
	flex-wrap: wrap
	flex-direction: column
	.search-wrapper
		width: 100%
		max-width: 600px
		margin-bottom: 1rem
		display: flex
		justify-content: space-between
		& > button
			flex-shrink: 4
			margin-left: 10px
			padding: 3px 15px

	.users-wrapper
		max-width: 1024px
		width: 100%
		box-sizing: border-box
		.page-wrapper
			text-align: center
			.page
				display: inline-block
		.user-page
			display: flex
			flex-wrap: wrap
			justify-content: space-around
			&.slide-in-leave-active > div
				animation: slide-out-bck-center 0.4s cubic-bezier(0.550, 0.085, 0.680, 0.530) both
			.user
				box-sizing: content-box
				width: 480px
				margin: 5px
				height: 64px
				border: 1px solid #EEE
				box-shadow: 0 0 2px #CCC
				img
					width: 64px
					height: 64px
					margin-right: 10px
				.username
					position: absolute
					top: 4px
					font-size: 22px
					width: 385px
					overflow: hidden
					white-space: nowrap
					text-overflow: ellipsis
					color: inherit !important
					&:hover, &:active, &:focus
						text-decoration: underline
				span, i
					position: relative
					top: -8px
					vertical-align: middle
				span
					margin-right: 10px

		// Once other element leaves, enter new element
		.user-page:not(.slide-in-leave-active) + .user-page, .user-page:first-of-type
			div
				animation: slide-in-fwd-center 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both

		// Hide entering element until other leaves
		.slide-in-leave-active + .user-page, .user-page + .slide-in-leave-active
			display: none
</style>
