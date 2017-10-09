import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '@/store';

import Home from '@/views/Home';
import SearchImages from '@/views/SearchImages';
import SearchUsers from '@/views/SearchUsers';
import Upload from '@/views/Upload';
import UploadingGuidelines from '@/views/UploadingGuidelines';
import Post from '@/views/Post';
import PendingPosts from '@/views/PendingPosts';
import Profile from '@/views/Profile';
import Settings from '@/views/Settings';
import Login from '@/views/Login';
import Register from '@/views/Register';
import NotFoundComponent from '@/views/404';

Vue.use(VueRouter);

const routes = [
	{
		path: '/',
		name: 'home',
		component: Home
	},
	{
		path: '/search/images',
		name: 'search-images',
		component: SearchImages
	},
	{
		path: '/search/users',
		name: 'search-users',
		component: SearchUsers
	},
	{
		path: '/upload',
		name: 'upload',
		component: Upload,
		beforeEnter(to, from, next) {
			if (store.state.hasToken)
				return next();
			return next('/login');
		}
	},
	{
		path: '/uploading-guidelines',
		name: 'uploading-guidelines',
		component: UploadingGuidelines
	},
	{
		path: '/post/:id',
		name: 'post',
		component: Post
	},
	{
		path: '/pending',
		name: 'pending',
		component: PendingPosts,
		beforeEnter(to, from, next) {
			if (store.state.hasToken)
				return next();
			return next('/login');
		}
	},
	{
		path: '/user/:id',
		name: 'profile',
		component: Profile
	},
	{
		path: '/settings',
		name: 'settings',
		component: Settings,
		beforeEnter(to, from, next) {
			if (store.state.hasToken)
				return next();
			return next('/login');
		}
	},
	{
		path: '/login',
		name: 'login',
		component: Login,
		beforeEnter(to, from, next) {
			if (!store.state.loggedIn)
				return next();
			Vue.prototype.$Progress.fail();
			return next('/');
		}
	},
	{
		path: '/logout',
		name: 'logout',
		beforeEnter(to, from, next) {
			if (store.state.loggedIn)
				store.commit('logout');
			return next('/');
		}
	},
	{
		path: '/register',
		name: 'register',
		component: Register,
		beforeEnter(to, from, next) {
			if (!store.state.loggedIn)
				return next();
			Vue.prototype.$Progress.fail();
			return next('/');
		}
	},
	{
		path: '*',
		name: '404',
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
