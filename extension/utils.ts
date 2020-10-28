class background {
  static async execute<T>(route: string, data?: any) {
    return await new Promise<T>(t => chrome.runtime.sendMessage({ route, data }, t));
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
    //   this.cache.set(key, new Promise(t => chrome.storage.sync.get(key, t)).then(t => t[key]));
    // }
    // return await this.cache.get(key) as T;
    return await new Promise(t => chrome.storage.sync.get(key, t)).then(t => t[key] as T);
  }

  static async getTracks() {
    return await this.get<Track[]>('tracks') || [];
  }
  static async setTracks(tracks: Track[]) {
    return await this.set('tracks', tracks);
  }

  static async getUnreadTracks() {
    return await this.get<string[]>('unreadTracks') || [];
  }
  static async setUnreadTracks(unreadTracks: string[]) {
    return await this.set('unreadTracks', unreadTracks);
  }

}

class api {
  static baseUrl = 'https://mmorgan-tracking-app.herokuapp.com';

  static async fetch<T>(url: string) {
    return await fetch(`${this.baseUrl}${url}`).then(t => t.json()).then(t => t as T);
  }

  static async fetchTrack(trackingNumber: string) {
    return await this.fetch<Track>(`/track/${trackingNumber}`);
  }


}


function promisify<T, U>(fn: (args: T, cb?: (u?: U) => void) => void, context?: any): (args?: T) => Promise<U> {
  return t => new Promise<U>(r => (context ? fn.bind(context) : fn)(t, r));
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}