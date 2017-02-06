import Vue from 'vue';

export function getUser() {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			return resolve({
				username: "Brussell",
				notifications: 2,
				likes: 1503,
				favorites: 64,
				avatar: "http://placehold.it/32x32"
			});
		}, 2000);
	});
}

export function recentImages(amount) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			return resolve([
				'http://placehold.it/221x356', 'http://placehold.it/400x500', 'http://placehold.it/400x500',
				'http://placehold.it/2000x1164', 'http://placehold.it/508x673', 'http://placehold.it/1920x1080',
				'http://placehold.it/1920x1080', 'http://placehold.it/400x500', 'http://placehold.it/400x500'
			]);
		}, 3000);
	});
}
