<template>
<body>
	<div id="base">
		<p>todo</p>
	</div>
</body>
</template>

<script>
export default {
	data() {
		return {

		};
	},
	computed: {
		user() {
			return this.$store.state.user
		}
	},
	methods: {
		upload() {
			this.$Progress.start();

			this.$http.post(API_BASE_URL + 'images', {

			}, {
				responseType: 'json',
				headers: {
					'Authorization': localStorage.getItem('token')
				}
			}).then(response => {
				this.$Progress.finish();
			}).catch(error => {
				this.$Progress.fail();
				console.error(error);
			});
		}
	}
}
</script>

<style lang="sass" scoped>

</style>
