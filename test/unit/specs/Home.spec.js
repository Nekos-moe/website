import Vue from 'vue';
import Hello from 'src/components/Home';

describe('Hello.vue', () => {
	it('should render correct contents', () => {
		const Constructor = Vue.extend(Hello);
		const vm = new Constructor().$mount();
		expect(vm.$el.querySelector('.account-view .username').textContent)
			.to.equal('Brussell');
	});
});
