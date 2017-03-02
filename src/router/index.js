import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '@/store';

import Home from '@/views/Home';
import SearchImages from '@/views/SearchImages';
import Upload from '@/views/Upload';
import Login from '@/views/Login';
import NotFoundComponent from '@/views/404';

Vue.use(VueRouter);

const routes = [
	{
		path: '/',
		component: Home
	},
	{
		path: '/search/images',
		component: SearchImages
	},
	{
		path: '/upload',
		component: Upload,
		beforeEnter(to, from, next) {
			if (store.state.hasToken)
				return next();
			return next('/login');
		}
	},
	{
		path: '/login',
		component: Login,
		beforeEnter(to, from, next) {
			if (!store.state.loggedIn)
				return next();
			Vue.prototype.$Progress.fail();
			return next('/');
		}
	},
	{
		path: '*',
		component: NotFoundComponent
	}
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

export default router;
