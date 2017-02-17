import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		hasToken: !!localStorage.getItem('token'),
		loggedIn: null,
		user: {} /* {
			username: "Loading...",
			notifications: 0,
			likes: 0,
			favorites: 0,
			avatar: "http://placehold.it/32x32"
		} */
	},
	actions: {
		async getSelf({ commit }) {
			let token = localStorage.getItem('token');

			if (!token) {
				commit('loggedIn', false);
				return commit('hasToken', false);
			}

			try {
				let response = await Vue.prototype.$http.get(API_BASE_URL + 'users/@me', {
					responseType: 'json',
					headers: { 'Authorization': token }
				});

				if (!response.data.user)
					return commit('loggedIn', false);

				commit('user', response.data.user);
				return commit('loggedIn', true);
			} catch (e) {
				if (!error.response)
					return console.error(error.message);
				if (error.response.status !== 401)
					return console.error(error.response);
				return commit('loggedIn', false);
			}
		}
	},
	mutations: {
		user(state, user) {
			state.user = user;
		},
		loggedIn(state, value) {
			state.loggedIn = value;
		},
		hasToken(state, value) {
			state.hasToken = value;
		}
	},
	getters: {
	}
});

export default store;
