<template>
<div id="base-profile">
	<div v-if="!profile">
		<!-- In the future, a loading spinner component goes here -->
	</div>
	<div class="profile" v-if="profile">
		<img :src="profile.avatar || require('@/../assets/images/404.jpg')" class="avatar-profile">
		<p class="username">{{ profile.username }} <Tag v-if="profile.roles && profile.roles.length" color="green" :closable="editingRoles" @on-close="revokeRole" :name="profile.roles[0]">{{ profile.roles[0] | deCamelCase }}</Tag> <Button v-if="user && user.roles && user.roles.includes('admin')" type="warning" size="small" @click="editingRoles = !editingRoles">{{ editingRoles ? 'Stop editing roles' : 'Edit roles' }}</Button></p>
		<div class="new-role-input-wrapper" v-if="editingRoles">
			<Input placeholder="Role" v-model="newRole">
				<Button slot="append" size="small" @click="grantRole">Grant</Button>
			</Input>
		</div>
		<div class="icon-text-container">
			<Icon type="thumbsup" size="20" color="#47dced" />
			<span class="likes">{{ profile.likesReceived | humanize }} Likes</span>
			<Icon type="android-favorite" size="20" color="#ed4778" />
			<span class="favorites">{{ profile.favoritesReceived | humanize }} Favorites</span>
		</div>
		<p class="info">Joined <timeago :since="profile.createdAt"></timeago></p>
		<p class="info">{{ profile.uploads | humanize }} images uploaded</p>
	</div>
	<div class="images-wrapper" v-if="profile">
		<Tabs @on-click="changeTab" type="card">
			<Tab-pane label="Uploads" name="uploads"></Tab-pane>
			<Tab-pane label="Likes" name="likes"></Tab-pane>
			<Tab-pane label="Favorites" name="favorites"></Tab-pane>
		</Tabs>
		<div class="page-wrapper">
			<Page class-name="page" :current="page" :page-size="1" :total="hitEnd ? images.length : images.length + 1" @on-change="changePage"></Page>
		</div>
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
			IMAGE_BASE_URL,
			images: [],
			page: 1,
			direction: 'right',
			profile: null,
			mode: 'uploads',
			hitEnd: false,
			editingRoles: false,
			newRole: ''
		};
	},
	computed: {
		user() {
			return this.$store.state.user;
		}
	},
	methods: {
		changePage(page) {
			if (page < this.age && page !== 1)
				this.direction = 'left';
			else if (page > this.page) {
				if (page < this.images.length)
					this.direction = 'right';
				else if (this.images.length !== 0 && this.images.length % 3 === 0 && this.images[this.images.length - 1].length % 9 === 0 && this.images.length === page) {
					this.page = page; // To make getXXXXX work right
					if (this.mode === 'uploads')
						this.getUploads();
					else
						this.getImages();
					this.direction = 'right';
				} else
					this.hitEnd = true
			}
			this.page = page;
		},
		async getUser() {
			try {
				if (!this.$route.params.id)
					return;

				let response = await this.$http.get(`${API_BASE_URL}user/${this.$route.params.id}`, {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				});

				this.profile = response.data.user;
				return;
			} catch(error) {
				console.error(error);
				this.$Modal.error({
					title: 'Error Requesting User Data',
					content: error ? error.response && error.response.data.message || error.message : 'Unknown Error'
				});
			}
		},
		async getImages() {
			try {
				if (!this.profile)
					return;

				let ids = this.mode === 'likes' ? this.profile.likes : this.profile.favorites;
				ids = ids.slice(9 * (this.page - 1), 9 * (this.page - 1) + 27);

				let response = await this.$http.post(API_BASE_URL + 'batch/images', { ids }, {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				});

				if (response.data.images.length === 0)
					this.hitEnd = true;
				else {
					while (response.data.images.length > 0)
						this.images.push(response.data.images.splice(0, 9));

					if (this.images[this.images.length - 1].length !== 9)
						this.hitEnd = true;
				}

				return response;
			} catch(error) {
				console.error(error);
				this.$Modal.error({
					title: 'Error Requesting Image Data',
					content: error ? error.response && error.response.data.message || error.message : 'Unknown Error'
				});
			}
		},
		async getUploads() {
			try {
				if (!this.profile)
					return;

				let response = await this.$http.post(API_BASE_URL + 'images/search', {
					sort: 'recent',
					limit: 27,
					skip: this.page !== 1 ? this.page * 9 : 0,
					uploader: {
						id: this.profile.id
					}
				}, {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				});

				if (response.data.images.length === 0)
					this.hitEnd = true;
				else {
					while (response.data.images.length > 0)
						this.images.push(response.data.images.splice(0, 9));

					if (this.images[this.images.length - 1].length !== 9)
						this.hitEnd = true;
				}

				return response;
			} catch(error) {
				console.error(error);
				this.$parent.$data.modalData = {
					title: 'Request Error',
					body: error.response && error.response.data.message || error.message,
					type: 'error'
				};
			}
		},
		changeTab(name) {
			switch (name) {
				case 'uploads':
					this.mode = 'uploads';
					break;
				case 'likes':
					this.mode = 'likes';
					break;
				case 'favorites':
					this.mode = 'favorites';
					break;
			}

			// document.getElementsByClassName('active-tab')[0].classList.remove('active-tab');
			// e.target.classList.add('active-tab');
			this.page = 1;
			this.images = [];
			this.hitEnd = false;
			this.direction = 'right';

			if (this.mode === 'uploads')
				this.getUploads();
			else
				this.getImages();
		},
		async revokeRole(e, name) {
			try {
				let resp = await this.$http.patch(`${API_BASE_URL}user/${this.profile.id}/roles`, {
					action: 'revoke',
					role: name
				}, { headers: { 'Authorization': localStorage.getItem('token') } });

				this.$parent.$delete(this.profile.roles, this.profile.roles.indexOf(name));
				return this.$Notice.success({
					title: 'Role Revoked',
					desc: `The role "${name}" has been revoked from ${this.profile.username}`
				});
			} catch (error) {
				console.error(error);
				return this.$Notice.error({
					title: 'Error Revoking Role',
					desc: error ? error.response && error.response.data.message || error.message : 'Unknown Error'
				});
			}

		},
		async grantRole() {
			try {
				let resp = await this.$http.patch(`${API_BASE_URL}user/${this.profile.id}/roles`, {
					action: 'grant',
					role: this.newRole
				}, { headers: { 'Authorization': localStorage.getItem('token') } });

				this.$Notice.success({
					title: 'Role Granted',
					desc: `The role "${this.newRole}" has been granted to ${this.profile.username}`
				});

				this.profile.roles.push(this.newRole);
				this.newRole = '';
				return null;
			} catch (error) {
				console.error(error);
				return this.$Notice.error({
					title: 'Error Granting Role',
					desc: error ? error.response && error.response.data.message || error.message : 'Unknown Error'
				});
			}
		}
	},
	async mounted() {
		await this.getUser();
		if (this.mode === 'uploads')
			this.getUploads();
		else
			this.getImages();
	},
	watch: {
		async $route() {
			await this.getUser();
			if (this.mode === 'uploads')
				this.getUploads();
			else
				this.getImages();
		}
	}
}
</script>

<style lang="sass">
#base-profile
	.profile
		margin: 1rem auto
		text-align: center
		font-family: 'Nunito', sans-serif
		hr
			border: none
			border-top: 1px solid #ECECEC
		.icon-text-container
			margin: auto auto 1rem
			i
				display: inline-block
			span
				display: inline-block
				padding-left: 5px
				font-size: 20px
				&.likes
					color: #47dced
				&.favorites
					color: #ed4778
			i + span
				margin-right: 1rem
		.avatar-profile
			max-width: 256px
			max-height: 256px
			border-radius: 5%
		.username
			margin: 1rem
			font-size: 2rem
			.ivu-tag
				position: relative
				top: -3px
				&:first-of-type
					margin-left: 10px
			.ivu-btn
				position: relative
				top: -3px
		.new-role-input-wrapper
			margin: 0 auto 20px
			width: 256px
		.info
			margin-top: 5px
	.images-wrapper
		margin-top: 3rem
		.ivu-tabs
			.ivu-tabs-nav
				text-align: center
				float: none
		.page-wrapper
			text-align: center
			.page
				display: inline-block
		.image-page
			margin: auto
			display: flex
			flex-wrap: wrap
			justify-content: space-around
			max-width: 1000px
			&.slide-in-leave-active > div
				animation: slide-out-bck-center 0.4s cubic-bezier(0.550, 0.085, 0.680, 0.530) both

		// Once other element leaves, enter new element
		.image-page:not(.slide-in-leave-active) + .image-page, .image-page:first-of-type
			div
				animation: slide-in-fwd-center 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both

		// Hide entering element until other leaves
		.slide-in-leave-active + .image-page, .image-page + .slide-in-leave-active
			display: none

</style>
