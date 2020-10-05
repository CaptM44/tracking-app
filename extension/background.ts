
chrome.runtime.onInstalled.addListener(() => init());

async function init() {
  console.log("Starting Tracker...");

  update();
  chrome.alarms.create('alarm1', { periodInMinutes: 15 })

  chrome.contextMenus.create({ title: "Tracker App - add track for '%s'", contexts: ["selection"], id: 'ADD:TRACK' });
}

async function update() {
  let updates = JSON.parse(localStorage.getItem('updates')) || [];
  updates.push(new Date().toLocaleString());
  localStorage.setItem('updates', JSON.stringify(updates));
  console.log('updating...');


  let tracks = await storage.get<string[]>('tracks') || [];
  for (let track of tracks) {
    let status = await api.getStatus(track);

    let statuses = await storage.get<{}>('statuses') || {};
    statuses[track] = status;
    await storage.set('statuses', statuses);
  }

  console.log('updated');
}

async function addTrack(trackingNumber: string) {
  let tracks = await storage.get<string[]>('tracks') || [];
  tracks.push(trackingNumber);
  await storage.set('tracks', tracks);
}

// chrome.runtime.onMessage.addListener((msg, sender, send) => {
//   if (msg.route == '/status') { send(statuses.get(msg.dat)) }
// });

chrome.contextMenus.onClicked.addListener(info => {
  if (info.menuItemId == 'ADD:TRACK') { addTrack(info.selectionText) }
});

chrome.alarms.onAlarm.addListener(info => {
  if (info.name == 'alarm1') { update() }
});
