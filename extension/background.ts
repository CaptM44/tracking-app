
chrome.runtime.onInstalled.addListener(() => init());

async function init() {
  console.log("Starting Tracker...");

  chrome.alarms.create('alarm1', { periodInMinutes: 15 })
  chrome.contextMenus.create({ title: `Tracker App - add track for "%s"`, contexts: ["selection"], id: 'ADD:TRACK' });

  await setBadge(0);
  // await update();
}

async function update() {
  let updates = JSON.parse(localStorage.getItem('updates')) || [];
  updates.push(new Date().toLocaleString());
  localStorage.setItem('updates', JSON.stringify(updates));
  console.log('updating...');


  let trackingNumbers = (await storage.getTracks()).map(t => t.trackingNumber);
  for (let trackingNumber of trackingNumbers) {
    let newTrack = await api.fetchTrack(trackingNumber);

    let tracks = await storage.getTracks();
    let track = tracks.find(t => t.trackingNumber == trackingNumber);

    if (newTrack.status != track.status) {
      await notify(newTrack.status, newTrack.trackingNumber);
      let unreadTracks = await storage.getUnreadTracks();
      if (!unreadTracks.includes(trackingNumber)) {
        unreadTracks.push(trackingNumber);
        await storage.setUnreadTracks(unreadTracks);
        setBadge(unreadTracks.length);
      }
    }

    Object.assign(track, newTrack);
    track.updateCount = (track.updateCount || 0) + 1;
    await storage.setTracks(tracks);
  }

  console.log('updated');
}

async function addTrack(trackingNumber: string) {
  let tracks = await storage.getTracks();

  if (!tracks.find(t => t.trackingNumber == trackingNumber)) {
    tracks.push({ trackingNumber });
    await storage.setTracks(tracks);
    await notifySilent('Track added', trackingNumber);
  }
  else {
    await notifySilent('Track already exists', trackingNumber);
  }
}

async function notify(title: string, message?: string) {
  return await new Promise<string>(r => chrome.notifications.create(null, { type: 'basic', iconUrl: 'images/icon.png', title, message }, r));
}

async function notifySilent(title: string, message?: string) {
  return await new Promise<string>(r => chrome.notifications.create(null, { type: 'basic', iconUrl: 'images/icon.png', title, message, silent: true }, r));
}

//background router
chrome.runtime.onMessage.addListener((msg, sender, send) => {
  new Promise(async resolve => {
    //update
    if (msg.route == '/update') {
      await update();
      resolve()
    }
    //update
    if (msg.route == '/sort') {
      let tracks = await storage.getTracks();
      tracks.sort((a, b) => new Date(a.date || new Date()).getTime() - new Date(b.date || new Date()).getTime())
      await storage.setTracks(tracks);
      resolve()
    }
    //get tracks
    if (msg.route == '/tracks') {
      let tracks = await storage.getTracks();
      resolve(tracks)
    }
    //get track
    if (msg.route == '/tracks/get') {
      let id: string = msg.data;
      let tracks = await storage.getTracks();
      let track = tracks.find(t => t.trackingNumber == id);
      resolve(track);
    }
    //update track
    if (msg.route == '/tracks/update') {
      let newTrack: Track = msg.data;
      let tracks = await storage.getTracks();
      let track = tracks.find(t => t.trackingNumber == newTrack.trackingNumber);
      Object.assign(track, newTrack);
      await storage.setTracks(tracks);
      resolve();
    }
    //delete track
    if (msg.route == '/tracks/delete') {
      let id: string = msg.data;
      let tracks = await storage.getTracks();
      let i = tracks.findIndex(t => t.trackingNumber == id);
      if (i >= 0) {
        tracks.splice(i, 1);
        await storage.setTracks(tracks);
      }
      resolve();
    }
    //move track up
    if (msg.route == '/tracks/move-up') {
      let id: string = msg.data;
      let tracks = await storage.getTracks();
      let i = tracks.findIndex(t => t.trackingNumber == id);
      if (i - 1 >= 0) {
        let track = tracks[i];
        tracks.splice(i, 1);
        tracks.splice(i - 1, 0, track);
        await storage.setTracks(tracks);
      }
      resolve();
    }
    //move track down
    if (msg.route == '/tracks/move-down') {
      let id: string = msg.data;
      let tracks = await storage.getTracks();
      let i = tracks.findIndex(t => t.trackingNumber == id);
      if (i + 1 <= tracks.length) {
        let track = tracks[i];
        tracks.splice(i, 1);
        tracks.splice(i + 1, 0, track);
        await storage.setTracks(tracks);
      }
      resolve();
    }
    //delete track
    if (msg.route == '/tracks/delete') {
      let id: string = msg.data;
      let tracks = await storage.getTracks();
      let i = tracks.findIndex(t => t.trackingNumber == id);
      if (i >= 0) {
        tracks.splice(i, 1);
        await storage.setTracks(tracks);
      }
      resolve();
    }
    if (msg.route == '/unread/clear') {
      await storage.setUnreadTracks([]);
      await setBadge(0);
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

async function setBadge(count: number, isError?: boolean) {
  let color = isError ? '#dc3545' : '#28a745';
  await new Promise(r => chrome.browserAction.setBadgeBackgroundColor({ color: color }, r));
  await new Promise(r => chrome.browserAction.setBadgeText({ text: count ? count.toString() : '' }, r));
}