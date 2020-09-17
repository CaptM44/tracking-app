
chrome.runtime.onInstalled.addListener(() => init());

let state = 0;

async function init() {
  console.log("Starting2...");

  setInterval(() => state++, 1000);

  chrome.runtime.onMessage.addListener((msg, sender, send) => {
    if (msg.route == '/index') { send(state) }
  });
}