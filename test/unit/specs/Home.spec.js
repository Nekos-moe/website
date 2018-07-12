import Vue from 'vue';
import Hello from '@/components/Home';

describe('Hello.vue', () => {
	it('should render correct contents', () => {
		const Constructor = Vue.extend(Hello);
		const vm = new Constructor().$mount();
		expect(vm.$el.querySelector('.navbar-brand > a').textContent)
			.to.equal('Nekos.moe');
	});
});
