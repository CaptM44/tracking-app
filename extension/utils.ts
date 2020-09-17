class background {
  static async get<T>(route: string) {
    return await new Promise<T>(t => chrome.runtime.sendMessage({ route }, t));
  }
}

class storage {
  static async set<T>(key: string, value: T) {
    await new Promise(t => chrome.storage.sync.set({ [key]: value }, t));
  }

  static async get<T>(key: string) {
    return (await new Promise(t => chrome.storage.sync.get(key, t)))[key] as T;
  }
}

function promisify<T, U>(fn: (args: T, cb?: (u?: U) => void) => void, context?: any): (args?: T) => Promise<U> {
  return t => new Promise<U>(r => (context ? fn.bind(context) : fn)(t, r));
}