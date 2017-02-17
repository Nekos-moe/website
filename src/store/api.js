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
