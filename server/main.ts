import * as express from 'express'
import * as puppeteer from 'puppeteer'
import * as chrono from 'chrono-node'
const app = express()
const port = process.env.PORT || 3000;
// let browser: puppeteer.Browser;

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/track/:id', async (req, res) => {
	let id = req.params.id;
	res.json(await getTracking(id));
})

app.listen(port, () => init());


//init app
async function init() {
	console.log(`App listening on port ${port}`)
	// browser = await puppeteer.launch();
}

//get tracking
async function getTracking(id: string) {

	let browser = await puppeteer.launch();
	let page = await browser.newPage();
	let link = `https://www.fedex.com/apps/fedextrack/?tracknumbers=${id}&locale=en_US`;
	await page.goto(link);

	let dateEl: puppeteer.ElementHandle = await page.waitForSelector('.tank-heading-primary', { timeout: 5000 }).catch(t => null);
	let dateText = dateEl && await page.evaluate(t => t.textContent, dateEl);
	let date = dateText && chrono.parseDate(dateText);

	let statusEl: puppeteer.ElementHandle = await page.waitForSelector('.statusChevron_key_status', { timeout: 5000 }).catch(t => null);
	let statusText = statusEl && await page.evaluate(t => t.textContent, statusEl);
	let status = normalizeStatus(statusText);
	await browser.close();

	return {
		status: status,
		date: date,
		link: link
	};
}

//normalize status
function normalizeStatus(status: string) {
	let s = status && status.toLowerCase();

	if (s == null) { return 'Not Available' }
	if (s == 'initiated') { return 'Initiated' }
	if (s == 'picked up') { return 'Picked up' }
	if (s == 'in transit') { return 'In Transit' }
	if (s == 'delivered') { return 'Delivered' }

	return status;
}