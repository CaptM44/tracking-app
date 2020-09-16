import { browser } from 'webextension-polyfill-ts'

chrome.runtime.onInstalled.addListener(async function () {



  let t = await browser.storage.sync.set({ color: '#3aa757' });
  console.log("Starting2...");

  let i = 1;
  setInterval(async () => {
    i++;
    await browser.storage.sync.set({ color: `#${i % 10}aa${i % 10}${i % 10}7` });
    let tt = await browser.storage.sync.get('color');
    console.log(tt)
  }, 1000)


  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { hostContains: 'c' },
      })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

// function promisify<T, U>(fn: (args: T, cb: (u: U) => void) => any): (args: T) => Promise<U> {
//   // await new Promise(r => chrome.storage.sync.set({ color: '#3aa757' }, r));
//   return t => new Promise<U>(r => fn(t, r));
// }