class background {
  static async get<T>(route: string) {
    return await new Promise<T>(t => chrome.runtime.sendMessage({ route }, t));
  }
}

class storage {
  static cache = new Map<string, Promise<any>>();

  static async set<T>(key: string, value: T) {
    // this.cache.set(key, Promise.resolve(value));
    await new Promise(t => chrome.storage.sync.set({ [key]: value }, t));
  }

  static async get<T>(key: string) {
    // if (!this.cache.has(key)) {
    // this.cache.set(key, new Promise(t => chrome.storage.sync.get(key, t)).then(t => t[key]));
    // }
    // return await this.cache.get(key) as T;
    return await new Promise(t => chrome.storage.sync.get(key, t)).then(t => t[key]);
  }
}

function promisify<T, U>(fn: (args: T, cb?: (u?: U) => void) => void, context?: any): (args?: T) => Promise<U> {
  return t => new Promise<U>(r => (context ? fn.bind(context) : fn)(t, r));
}