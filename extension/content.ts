

// (async function () {

// 	console.log('start...')

// 	// const shadowWrapper = document.createElement('div');
// 	// shadowWrapper.setAttribute('style', `
// 	// 	position: fixed;
// 	// 	top: 0;
// 	// 	left: 0;
// 	// 	width: 100%;
// 	// 	height: 100%;
// 	// `);

// 	// const shadowRoot = shadowWrapper.attachShadow({ mode: 'open' });
// 	// const bootstrapStyle = document.createElement('link');
// 	// bootstrapStyle.setAttribute('rel', 'stylesheet');
// 	// bootstrapStyle.setAttribute('src', 'bootstrap.min.css');
// 	// shadowRoot.appendChild(bootstrapStyle);

// 	// const modal = document.createElement('div');
// 	// modal.id = "myModal";
// 	// shadowRoot.appendChild(modal);
// 	// Whatever you need to do to create your modal...
// 	const modal = document.createElement('div');
// 	// modal.id = "myModal";
// 	// shadowRoot.appendChild(modal);


// 	const bootstrapStyle = document.createElement('link');
// 	bootstrapStyle.setAttribute('rel', 'stylesheet');
// 	bootstrapStyle.setAttribute('href', 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css');
// 	document.head.appendChild(bootstrapStyle);

// 	// addbsscritp
// 	let srcs = [
// 		'https://code.jquery.com/jquery-3.3.1.slim.min.js',
// 		'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js',
// 		'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js',
// 	]
// 	for (let src of srcs) {
// 		const script = document.createElement('script');
// 		script.setAttribute('src', src);
// 		document.head.appendChild(script);
// 	}

// 	const div = document.createElement('div');
// 	let modalHtml = `
// 		<div class="modal fade" id="test2" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
// 			<div class="modal-dialog" role="document">
// 			<div class="modal-content">
// 				<div class="modal-header">
// 				<h5 class="modal-title" id="exampleModalLabel">test  title</h5>
// 				<button type="button" class="close" data-dismiss="modal" aria-label="Close">
// 					<span aria-hidden="true">&times;</span>
// 				</button>
// 				</div>
// 				<div class="modal-body">
// 				...
// 				</div>
// 				<div class="modal-footer">
// 				<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
// 				<button type="button" class="btn btn-primary">Save changes</button>
// 				</div>
// 			</div>
// 			</div>
// 		</div>

// 	  `;
// 	div.innerHTML = modalHtml;
// 	document.body.appendChild(div);

// 	const sc = document.createElement('script');
// 	sc.innerHTML = `setTimeout(() => jQuery('#test2').modal('show'), 1000)`;
// 	// document.head.appendChild(sc);


// 	// <script>
// 	// console.log(12)	
// 	// //
// 	// </script>

// 	// $("#myModal").modal();
// 	console.log('end...')

// })();