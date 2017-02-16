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
		let _randomImages = [
				'http://placehold.it/221x356', 'http://placehold.it/400x500', 'http://placehold.it/2000x1164',
				'http://placehold.it/508x673', 'http://placehold.it/1920x1080'
			],
			randomImages = [
				'http://catgirls.brussell98.tk/files/2e6bdda703e688c5a19b192210c39673.jpg',
				'http://catgirls.brussell98.tk/files/7d29e9550b1c3650a44d5aba96cd2f37.jpg',
				'http://catgirls.brussell98.tk/files/986ee9945a09bf44d8282625b3d7b669.jpg',
				'http://catgirls.brussell98.tk/files/b4e4441e6d0c008f5378e527fb474a25.jpg',
				'http://catgirls.brussell98.tk/files/5b9c8a8a20e18ea81d6e754048e9751b.jpg'
			], res = [];

		for (let i = 0; i < amount; i++)
			res.push(randomImages[~~(Math.random() * randomImages.length)]);

		setTimeout(() => {
			return resolve(res);
		}, 3000);
	});
}
