<template>
<div id="base-settings">
	<div class="top">
		<h1 class="title has-text-primary">Settings</h1>
	</div>

	<div class="form">
		<b-field label="NSFW Posts">
			<b-switch v-model="form.nsfw" type="is-danger">Exclude by default</b-switch>
		</b-field>
		<b-field label="Blacklisted tags">
			<b-taginput
				v-model="form.blacklist"
				maxlength="50"
				placeholder="bad anatomy"
				autocomplete
				allow-new
				:data="form.filteredTagsBlacklist"
				@typing="getFilteredTagsBlacklist"></b-taginput>
		</b-field>
		<b-field label="Favorite tags">
			<b-taginput
				v-model="form.savedTags"
				maxtags="100"
				maxlength="50"
				placeholder="paw pose"
				autocomplete
				allow-new
				:data="form.filteredTagsSaved"
				@typing="getFilteredTagsSaved"></b-taginput>
		</b-field>
		<div class="field is-grouped">
			<div class="control">
				<button class="button is-primary" @click="save">Save</button>
			</div>
		</div>
	</div>
</div>
</template>

<script>
export default {
	data() {
		return {
			form: {
				nsfw: false,
				blacklist: [],
				filteredTagsBlacklist: [],
				savedTags: [],
				filteredTagsSaved: []
			},
			allTags: [],
			oldNSFW: false
		};
	},
	computed: {
		user() {
			return this.$store.state.user;
		},
		loggedIn() {
			return this.$store.state.loggedIn;
		},
		cachedTags() {
			return this.$store.state.tagCache || [];
		}
	},
	methods: {
		getFilteredTagsBlacklist(input) {
			input = input.toLowerCase();

			this.form.filteredTagsBlacklist = input ? this.allTags.filter(tag => tag.toLowerCase().indexOf(input) > -1) : this.allTags;
			return;
		},
		getFilteredTagsSaved(input) {
			input = input.toLowerCase();

			this.form.filteredTagsSaved = input ? this.allTags.filter(tag => tag.toLowerCase().indexOf(input) > -1) : this.allTags;
			return;
		},
		async getTags() {
			try {
				const response = await this.$http.get(API_BASE_URL + 'tags');

				this.allTags = response.data.tags;
				return;
			} catch (error) {
				if (!error.response)
					return console.error(error.message);
				return console.error(error.response);
			}
		},
		async save() {
			try {
				this.$store.commit('setPreferences', {
					allowNSFW: !this.form.nsfw,
					blacklist: this.form.blacklist
				});

				await this.$http.patch(API_BASE_URL + 'account/settings', {
					savedTags: this.form.savedTags
				}, { headers: { 'Authorization': localStorage.getItem('token') } });

				this.$store.state.user.savedTags = this.form.savedTags;

				return this.$toast.open({
					type: 'is-success',
					message: 'Settings saved',
					duration: 3000,
					position: 'is-bottom'
				});
			} catch (error) {
				console.error(error);
				return this.$dialog.alert({
					type: 'is-danger',
					title: 'Error updating user settings',
					message: error ? error.response && error.response.data.message || error.message : 'Unknown Error',
					hasIcon: true
				});
			}
		}
	},
	beforeMount() {
		this.getTags();

		this.form.nsfw = this.$store.state.preferences ? !this.$store.state.preferences.allowNSFW : true;
		this.form.blacklist = this.$store.state.preferences.blacklist || [];
		this.form.savedTags = this.$store.state.user.savedTags || [];

		this.oldNSFW = !this.form.nsfw; // Value is flipped so un-flip it
	},
	beforeDestroy() {
		if (this.oldNSFW !== this.$store.state.preferences.allowNSFW)
			this.$store.dispatch('getTags', true);
	},
	watch: {
		loggedIn() {
			if (this.user.savedTags && this.user.savedTags.length > 0)
				this.form.savedTags = this.user.savedTags;
		}
	}
}
</script>

<style lang="sass">
#base-settings
	.top
		margin: 40px 0
		text-align: center
		h1
			font-size: 3em

	.form
		margin: auto
		max-width: 700px
</style>
