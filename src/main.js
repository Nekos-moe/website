// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueRouter from 'vue-router';
import store from './store';
import axios from 'axios';
import * as filters from './filters';

import App from './App';

import NavBar from './components/NavBar';

import Home from './components/Home';
import About from './components/About';
import NotFoundComponent from './components/404';

Vue.prototype.$http = axios;

Object.keys(filters).forEach(key => {
	Vue.filter(key, filters[key]);
});

Vue.component('NavBar', NavBar);

Vue.use(VueRouter);

const routes = [
	{ path: '/', component: Home },
	{ path: '/about', component: About },
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
