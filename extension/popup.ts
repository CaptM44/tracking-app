


(async function () {

	await render();

	$('.tracks').on('click', '.btn-delete', async (t) => {
		let id = $(t.currentTarget).data('id');
		await background.execute('/tracks/delete', id);
		render();
	});



})();

async function render() {
	let tracks = await background.execute<Track[]>('/tracks');
	$('.tracks').empty();
	for (let track of tracks) {
		$('.tracks').append(/* html */`
			<tr>
				<td title="${track.carrier}"><img class="carrier-icon" src="/images/${track.carrier}.png"></td>
				<td><a href="${track.url}" target="_blank">${track.trackingNumber}</a></td>
				<td class="${track.status == 'Delivered' ? 'text-success' : ''}">${track.status || 'N/A'}</td>
				<td title="update count: ${track.updateCount}">${track.date ? new Date(track.date).toLocaleDateString() : 'N/A'}</td>
				<td><div class="btn-delete btn btn-light btn-sm" data-id="${track.trackingNumber}"><i class="fa fa-trash"></i></div></td>
			</tr>
		`);
	}
}