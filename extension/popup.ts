


(async function () {


	$('body').on('click', '.refresh-btn', async e => {
		await background.execute('/update');
		render();
	});

	$('body').on('click', '.options-btn', async e => {
		await new Promise(r => chrome.runtime.openOptionsPage(r));
	});

	$('body').on('click', '.delete-btn', async e => {
		let id = $(e.currentTarget).data('id');
		await background.execute('/tracks/delete', id);
		render();
	});

	$('body').on('click', '.move-up-btn', async e => {
		let id = $(e.currentTarget).data('id');
		await background.execute('/tracks/move-up', id);
		render();
	});

	$('body').on('click', '.move-down-btn', async e => {
		let id = $(e.currentTarget).data('id');
		await background.execute('/tracks/move-down', id);
		render();
	});

	await render();
	await background.execute('/badge/clear');

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
				<td title="update count: ${track.updateCount}">${track.date ? formatDate(track.date) : 'N/A'}</td>
				<td>
					<div class="dropdown">
						<div class="btn btn-sm btn-light dropdown-toggle" data-toggle="dropdown"><i class="fa fa-ellipsis-v"></i></div>
						<div class="dropdown-menu dropdown-menu-right">
							<div class="dropdown-item disabled" data-id="${track.trackingNumber}"><i class="fa fa-edit mr-2"></i> Edit</div>
							<div class="dropdown-item delete-btn" data-id="${track.trackingNumber}"><i class="fa fa-trash mr-2"></i> Delete</div>
							<div class="dropdown-item move-up-btn" data-id="${track.trackingNumber}"><i class="fa fa-level-up mr-2"></i> Move up</div>
							<div class="dropdown-item move-down-btn" data-id="${track.trackingNumber}"><i class="fa fa-level-down mr-2"></i> Move down</div>
						</div>
					</div>
				</td>
			</tr>
		`);
	}

	$('.no-tracks').toggleClass('d-none', !!tracks.length);
}

