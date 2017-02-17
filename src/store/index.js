import Vue from 'vue';
import Vuex from 'vuex';

import { getUser } from './api';

Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		user: {
			username: "Loading...",
			notifications: 0,
			likes: 0,
			favorites: 0,
			avatar: "http://placehold.it/32x32"
		}
	},
	actions: {
		getUser({ commit }) {
			getUser().then(user => commit('user', user));
		}
	},
	mutations: {
		user(state, user) {
			state.user = user;
		}
	},
	getters: {
	}
});

export default store;
