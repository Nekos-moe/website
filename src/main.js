// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import './promise-polyfill';
import Vue from 'vue';
import VueRouter from 'vue-router';
import store from './store';
import axios from 'axios';
import * as filters from './filters';
import VueProgressBar from 'vue-progressbar';

import App from './App';

import NavBar from './components/NavBar';

import Home from './components/Home';
import SearchImages from './components/SearchImages';
import NotFoundComponent from './components/404';

Vue.use(VueProgressBar, {
	color: '#2de58c',
	failedColor: 'red',
	thickness: '4px'
});

Vue.prototype.$http = axios;

Object.keys(filters).forEach(key => {
	Vue.filter(key, filters[key]);
});

Vue.component('NavBar', NavBar);

Vue.use(VueRouter);

const routes = [
	{ path: '/', component: Home },
	{ path: '/search/images', component: SearchImages },
	{ path: '*', component: NotFoundComponent }
];

const router = new VueRouter({
	mode: 'history',
	routes,
	scrollBehavior(to, from, savedPosition) {
		if (to.hash)
			return { selector: to.hash };
		if (savedPosition)
			return savedPosition;
		return { x: 0, y: 0 };
	}
});

const app = new Vue({
	el: '#app',
	router,
	store,
	...App
});
