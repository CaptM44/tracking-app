


(async function () {

	await render();

	$('.tracks').on('click', '.btn-delete', async (t) => {
		let id = $(t.currentTarget).data('id');
		let tracks = await storage.get<string[]>('tracks') || [];
		let i = tracks.indexOf(id)
		if (i >= 0) {
			tracks.splice(i, 1);
			await storage.set('tracks', tracks);
			render();
		}
	});



})();

async function render() {
	let tracks = await storage.get<string[]>('tracks') || [];
	$('.tracks').empty();
	for (let track of tracks) {
		// let status = await background.get<string>('/status', track);
		let status = (await storage.get<{}>('statuses') || {})[track] || 'N/A';
		$('.tracks').append(/* html */`
			<tr>
				<td><img class="carrier-icon" src="/images/usps.png"></td>
				<td>${track}</td>
				<td class="${status == 'Delivered' ? 'text-success' : ''}">${status}</td>
				<td><a href="https://mmorgan-tracking-app.herokuapp.com/track/${track}" target="_blank" class="btn btn-light btn-sm"><i class="fa fa-external-link"></i></a></td>
				<td><div class="btn-delete btn btn-light btn-sm" data-id="${track}"><i class="fa fa-trash"></i></div></td>
			</tr>
		`);
	}
}