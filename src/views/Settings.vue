<template>
<div id="base-settings">
	<div class="top">
		<h1 class="title has-text-primary">Settings</h1>
	</div>

	<div class="form">
		<b-field label="NSFW Posts">
			<b-switch v-model="form.nsfw" type="is-danger">Exclude by default</b-switch>
		</b-field>
		<b-field label="Blacklisted tags" :message="form.blacklistMessage" :type="form.blacklistMessage ? 'is-danger' : ''">
			<b-input v-model="form.blacklist" icon="label" @input="validateBlacklist"></b-input>
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
				blacklist: '',
				blacklistMessage: ''
			}
		};
	},
	computed: {
		user() {
			return this.$store.state.user;
		}
	},
	methods: {
		validateBlacklist(input) {
			if (!input || /^([^,]+)+(, *[^,]+)*$/.test(input))
				this.form.blacklistMessage = '';
			else
				this.form.blacklistMessage = 'Must be a valid list of tags';
		},
		save() {
			this.$store.commit('setPreferences', {
				allowNSFW: !this.form.nsfw,
				blacklist: this.form.blacklist && this.form.blacklist.split(/, */)
			});

			this.$toast.open({
				type: 'is-success',
				message: 'Settings saved',
				duration: 3000,
				position: 'is-bottom'
			});
		}
	},
	beforeMount() {
		this.form.nsfw = this.$store.state.preferences ? !this.$store.state.preferences.allowNSFW : true;
		this.form.blacklist = this.$store.state.preferences.blacklist ? this.$store.state.preferences.blacklist.join(', ') : '';
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
