
chrome.runtime.onInstalled.addListener(() => init());

let state = 0;

async function init() {
  console.log("Starting2...");

  setInterval(() => state++, 1000);




  chrome.contextMenus.create({
    title: "Tracker App - add track for '%s'",
    contexts: ["selection"],
    id: 'ADD:TRACK'
  });


}

async function addTrack(trackingNumber: string) {
  let tracks = await storage.get<string[]>('tracks') || [];
  tracks.push(trackingNumber);
  await storage.set('tracks', tracks);
}

chrome.runtime.onMessage.addListener((msg, sender, send) => {
  if (msg.route == '/index') { send(state) }
});

chrome.contextMenus.onClicked.addListener(info => {
  if (info.menuItemId != 'ADD:TRACK') { return }
  addTrack(info.selectionText);
});
