import '@/promise-polyfill';
import Vue from 'vue';
import router from '@/router';
import store from '@/store';
import axios from 'axios';
import * as filters from '@/filters';
import VueProgressBar from 'vue-progressbar';
import VueTimeago from 'vue-timeago';
import VueAnalytics from 'vue-analytics';
import Buefy from 'buefy';

import App from '@/App';
import NavBarBue from '@/components/NavBarBue';

Vue.config.productionTip = false;

Vue.use(Buefy, {
	defaultModalScroll: 'keep'
});
Vue.use(VueProgressBar, {
	color: '#2de58c',
	failedColor: 'red',
	thickness: '4px'
});

Vue.prototype.$http = axios;

Object.keys(filters).forEach(key => {
	Vue.filter(key, filters[key]);
});

Vue.component('NavBarBue', NavBarBue);

function requireAll(requireContext) {
	return requireContext.keys().reduce((current, next) => {
		current[next.substr(2, 5)] = requireContext(next);
		return current;
	}, {});
}

Vue.use(VueTimeago, {
	locale: 'en-US',
	locales: requireAll(require.context("vue-timeago/locales", true, /\.json$/))
});

Vue.use(VueAnalytics, {
	id: 'UA-72190085-3',
	router
});

const app = new Vue({
	el: '#app',
	router,
	store,
	...App
});
