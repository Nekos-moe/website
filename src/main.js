import '@/promise-polyfill';
import Vue from 'vue';
import router from '@/router';
import store from '@/store';
import axios from 'axios';
import * as filters from '@/filters';
import VueProgressBar from 'vue-progressbar';
import iView from 'iview';
import iView_locale from 'iview/src/locale/lang/en-US';
import VueTimeago from 'vue-timeago';
// import 'iview/dist/styles/iview.css';
import '@/nekos-theme.less';

import App from '@/App';
import NavBar from '@/components/NavBar';
import ImagePreview from '@/components/ImagePreview';

Vue.config.productionTip = false;

Vue.use(iView, { locale: iView_locale });
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
Vue.component('ImagePreview', ImagePreview);

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

const app = new Vue({
	el: '#app',
	router,
	store,
	...App
});
