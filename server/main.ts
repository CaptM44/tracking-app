import * as express from 'express';
import * as puppeteer from 'puppeteer';
import * as chrono from 'chrono-node';
import * as cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;
const selectorTimeout = 8000;

app.use(cors());

app.get('/', (req, res) => res.send('Tracker App'));

app.get('/track/:id', async (req, res) => {
	let trackingNumber = req.params.id;
	let carrier = req.query.carrier || null;
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
}

//get tracking
async function getTracking(trackingNumber: string, carrier?: string) {

	let track: Track = {
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
	let browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
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

	if (track.carrier == 'USPS') {
		let statusEl: puppeteer.ElementHandle = await page.waitForSelector('.delivery_status strong', { timeout: selectorTimeout }).catch(t => null);
		let statusText = statusEl && await page.evaluate(t => t.textContent, statusEl);
		track.status = normalizeStatus(statusText);

		let dateEl: puppeteer.ElementHandle = await page.waitForSelector('.expected_delivery', { timeout: selectorTimeout }).catch(t => null);
		let dateText = dateEl && await page.evaluate(t => t.textContent, dateEl);
		track.date = dateText && chrono.parseDate(dateText);
	}

	await browser.close();

	return track;
}

//normalize status
function normalizeStatus(status: string) {

	if (/Initiated/i.test(status)) { return 'Initiated' }
	if (/Label created/i.test(status)) { return 'Label Created' }
	if (/Picked up/i.test(status)) { return 'Picked up' }
	if (/In Transit/i.test(status)) { return 'In Transit' }
	if (/Delivered/i.test(status)) { return 'Delivered' }
	if (/Out for Delivery/i.test(status)) { return 'Out for Delivery' }

	//usps
	if (/On Its Way to USPS/i.test(status)) { return 'On Its Way to Carrier' }
	if (/Label Created, not yet in system/i.test(status)) { return 'Label Created' }
	if (/Pre-Shipment/i.test(status)) { return 'Pre-Shipment' }
	if (/USPS Currently Awaiting Package/i.test(status)) { return 'Carrier Awaiting Package' }
	if (/In-Transit/i.test(status)) { return 'In Transit' }

	//fedex
	if (/Shipment exception/i.test(status)) { return 'Shipment Exception' }

	//UPS
	if (/Shipment Ready for UPS/i.test(status)) { return 'Shipment Ready' }
	if (/On Its Way to UPS/i.test(status)) { return 'On Its Way to Carrier' }
	if (/Damage Reported/i.test(status)) { return 'Damage Reported' }
	if (/Loaded on Delivery Vehicle/i.test(status)) { return 'Loaded on Vehicle' }
	
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
		/^9[1-5][0-9]+$/,
		/^[A-Za-z]{2}[0-9]+US$/,
	];
	if (usps.some(t => t.test(trackingNumber))) { carriers.push('USPS') }

	return carriers;
}

//get url
function getCarrierUrl(carrier: string, trackingNumber: string) {
	if (carrier == 'Fedex') { return `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}` }
	if (carrier == 'UPS') { return `https://www.ups.com/track?tracknum=${trackingNumber}` }
	if (carrier == 'USPS') { return `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${trackingNumber}` }
}