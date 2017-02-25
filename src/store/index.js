import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		hasToken: !!localStorage.getItem('token'),
		loggedIn: null,
		user: {},
		preferences: localStorage.hasOwnProperty('preferences') ? JSON.parse(localStorage.getItem('preferences')) : {}
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
		},
		logout(state) {
			state.loggedIn = false;
			state.hasToken = false;
			state.user = {};
			localStorage.removeItem('token');
		}
	},
	getters: {
		NSFWImages(state) {
			return state.preferences.allowNSFW === true ? undefined : false;
		},
		blacklist(state) {
			return state.preferences.blacklist && state.preferences.blacklist.map(tag => `-"${tag}"`).join(' ') || undefined;
		}
	}
});

export default store;
