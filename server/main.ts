import * as express from 'express'
import * as puppeteer from 'puppeteer'
import * as chrono from 'chrono-node'
const app = express()
const port = process.env.PORT || 3000;
const selectorTimeout = 5000;
let browser: puppeteer.Browser;

app.get('/', (req, res) => res.send('Tracker App'))

app.get('/track/:id', async (req, res) => {
	let trackingNumber = req.params.id;
	let carrier = req.query.carrier;
	res.json(await getTracking(trackingNumber, carrier));
})

app.get('/carrier/:id', async (req, res) => {
	let trackingNumber = req.params.id;
	res.json(getCarrier(trackingNumber));
})

app.listen(port, () => init());


//init app
async function init() {
	console.log(`App listening on port ${port}`)
	browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
}

//get tracking
async function getTracking(trackingNumber: string, carrier?: string) {

	let track = {
		trackingNumber: trackingNumber,
		carrier: carrier,
		url: null,
		status: null,
		date: null
	};

	if (!track.carrier) { track.carrier = getCarrier(trackingNumber)[0] };
	if (!track.carrier) { return track }

	track.url = getCarrierUrl(track.carrier, trackingNumber);

	//open new page
	let page = await browser.newPage();
	//optimize ignoring resources
	await page.setRequestInterception(true);
	page.on('request', req => ['stylesheet', 'font', 'image'].some(t => t == req.resourceType()) ? req.abort() : req.continue());
	//open url
	await page.goto(track.url);

	if (track.carrier == 'Fedex') {
		let statusEl: puppeteer.ElementHandle = await page.waitForSelector('.statusChevron_key_status', { timeout: selectorTimeout }).catch(t => null);
		let statusText = statusEl && await page.evaluate(t => t.textContent, statusEl);
		track.status = normalizeStatus(statusText);

		let dateEl: puppeteer.ElementHandle = await page.waitForSelector('.tank-heading-primary', { timeout: selectorTimeout }).catch(t => null);
		let dateText = dateEl && await page.evaluate(t => t.textContent, dateEl);
		track.date = dateText && chrono.parseDate(dateText);
	}

	if (track.carrier == 'UPS') {
		let statusEl: puppeteer.ElementHandle = await page.waitForSelector('#stApp_txtPackageStatus', { timeout: selectorTimeout }).catch(t => null);
		let statusText = statusEl && await page.evaluate(t => t.textContent, statusEl);
		track.status = normalizeStatus(statusText);

		let dateEl: puppeteer.ElementHandle = await page.waitForSelector('#stApp_scheduledDelivery,#stApp_deliveredDate', { timeout: selectorTimeout }).catch(t => null);
		let dateText = dateEl && await page.evaluate(t => t.textContent, dateEl);
		track.date = dateText && chrono.parseDate(dateText);
	}

	return track;
}

//normalize status
function normalizeStatus(status: string) {
	let s = status && status.toLowerCase();

	if (s == 'initiated') { return 'Initiated' }
	if (s == 'picked up') { return 'Picked up' }
	if (s == 'in transit') { return 'In Transit' }
	if (s == 'delivered') { return 'Delivered' }

	return status;
}

//parse tracking number to get carrier
function getCarrier(trackingNumber: string) {
	let carriers: string[] = [];

	//Fedex
	let fedex = [
		/(\b96\d{20}\b)|(\b\d{15}\b)|(\b\d{12}\b)/,
		/\b((98\d\d\d\d\d?\d\d\d\d|98\d\d) ?\d\d\d\d ?\d\d\d\d( ?\d\d\d)?)\b/,
		/^[0-9]{15}$/,
	];
	if (fedex.some(t => t.test(trackingNumber))) { carriers.push('Fedex') }

	//UPS
	let ups = [
		/\b(1Z ?[0-9A-Z]{3} ?[0-9A-Z]{3} ?[0-9A-Z]{2} ?[0-9A-Z]{4} ?[0-9A-Z]{3} ?[0-9A-Z]|[\dT]\d\d\d ?\d\d\d\d ?\d\d\d)\b/,
	];
	if (ups.some(t => t.test(trackingNumber))) { carriers.push('UPS') }

	//USPS
	let usps = [
		/(\b\d{30}\b)|(\b91\d+\b)|(\b\d{20}\b)/,
		/^E\D{1}\d{9}\D{2}$|^9\d{15,21}$/,
		/^91[0-9]+$/,
		/^[A-Za-z]{2}[0-9]+US$/,
	];
	if (usps.some(t => t.test(trackingNumber))) { carriers.push('USPS') }

	return carriers;
}

function getCarrierUrl(carrier: string, trackingNumber: string) {
	if (carrier == 'Fedex') { return `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}` }
	if (carrier == 'UPS') { return `https://www.ups.com/track?tracknum=${trackingNumber}` }
}