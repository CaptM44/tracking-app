


(async function () {

	let indexEl = document.getElementById('index');

	indexEl.innerText = `${await background.get<number>('/index')}`;
	setInterval(async () => {
		indexEl.innerText = `${await background.get<number>('/index')}`;
	}, 1000);

})();