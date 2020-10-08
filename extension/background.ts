
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


  let tracks = await storage.getTracks();
  for (let track of tracks) {
    let newTrack = await api.fetchTrack(track.trackingNumber);
    Object.assign(track, newTrack);
    track.updateCount = (track.updateCount || 0) + 1;
    await storage.setTracks(tracks);
  }

  console.log('updated');
}

async function addTrack(trackingNumber: string) {
  let tracks = await storage.getTracks();
  tracks.push({ trackingNumber });
  await storage.setTracks(tracks);

  await notify('Track added', trackingNumber);
}

async function notify(title: string, message?: string) {
  return await new Promise<string>(r => chrome.notifications.create(null, { type: 'basic', iconUrl: 'images/icon.png', title, message, silent: true }, r));
}

//background router
chrome.runtime.onMessage.addListener((msg, sender, send) => {
  new Promise(async resolve => {
    if (msg.route == '/tracks') {
      resolve(await storage.getTracks())
    }
    if (msg.route == '/tracks/delete') {
      let id = msg.data;
      let tracks = await storage.getTracks();
      let i = tracks.findIndex(t => t.trackingNumber == id);
      if (i >= 0) {
        tracks.splice(i, 1);
        await storage.setTracks(tracks);
      }
      resolve();
    }
  }).then(send)
  return true;
});

chrome.contextMenus.onClicked.addListener(info => {
  if (info.menuItemId == 'ADD:TRACK') { addTrack(info.selectionText) }
});

chrome.alarms.onAlarm.addListener(info => {
  if (info.name == 'alarm1') { update() }
});


