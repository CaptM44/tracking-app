


(async function () {


	$('body').on('click', '.refresh-all-btn', async e => {
		await background.execute('/update');
		render();
	});

	$('body').on('click', '.options-btn', async e => {
		await new Promise(r => chrome.runtime.openOptionsPage(r));
	});

	$('body').on('click', '.sort-btn', async e => {
		await background.execute('/sort');
		render();
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

	$('body').on('click', '.edit-btn', async e => {
		let id = $(e.currentTarget).data('id');
		let track = await background.execute<Track>('/tracks/get', id);

		$('.edit-save-btn').data('id', track.trackingNumber);
		$('.edit-description').val(track.description);
		$('#edit-modal').modal('show');
		render();
	});

	$('body').on('click', '.edit-save-btn', async e => {
		let id = $(e.currentTarget).data('id');
		let description = $('.edit-description').val();
		await background.execute<void>('/tracks/update', { trackingNumber: id, description });

		$('#edit-modal').modal('hide');
		render();
	});


	$('body').on('click auxclick', 'a', async e => {
		if (e.ctrlKey || e.button == 1) {
			e.preventDefault();
			await new Promise(r => chrome.tabs.create({ url: e.currentTarget.href, selected: false }, r));
		}
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
				${track.carrier ?/* html */`<td title="${track.carrier}"><img class="carrier-icon" src="/images/${track.carrier}.png"></td>` : ''}
				${!track.carrier ?/* html */`<td class="text-center"><i class="fa fa-question-circle"></i></td>` : ''}
				<td>${track.description || ''}</td>
				${track.url ?/* html */`<td><a href="${track.url}" target="_blank">${track.trackingNumber}</a></td>` : ''}
				${!track.url ?/* html */`<td>${track.trackingNumber}</td>` : ''}
				<td class="${track.status == 'Delivered' ? 'text-success' : ''}">${track.status || 'N/A'}</td>
				<td title="update count: ${track.updateCount}">${track.date ? formatDate(track.date) : 'N/A'}</td>
				<td>
					<div class="dropdown">
						<div class="btn btn-sm btn-light dropdown-toggle" data-toggle="dropdown"><i class="fa fa-ellipsis-v"></i></div>
						<div class="dropdown-menu dropdown-menu-right">
							<div class="dropdown-item refresh-btn disabled" data-id="${track.trackingNumber}"><i class="fa fa-refresh fa-fw mr-1"></i> Refresh</div>
							<div class="dropdown-item edit-btn" data-id="${track.trackingNumber}"><i class="fa fa-edit fa-fw mr-1"></i> Edit</div>
							<div class="dropdown-item delete-btn" data-id="${track.trackingNumber}"><i class="fa fa-trash fa-fw mr-1"></i> Delete</div>
							<div class="dropdown-item move-up-btn" data-id="${track.trackingNumber}"><i class="fa fa-level-up fa-fw mr-1"></i> Move up</div>
							<div class="dropdown-item move-down-btn" data-id="${track.trackingNumber}"><i class="fa fa-level-down fa-fw mr-1"></i> Move down</div>
						</div>
					</div>
				</td>
			</tr>
		`);
	}

	$('.no-tracks').toggleClass('d-none', !!tracks.length);
}