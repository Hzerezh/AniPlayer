import { openDB, type DBSchema } from 'idb'

export type StoredMedia =
  | {
      source: 'file'
      file: File
    }
  | {
      source: 'url'
      url: string
    }

interface MyDB extends DBSchema {
  playlist: {
    key: string
    value: StoredMedia[]
  }
}

const dbPromise = openDB<MyDB>('aniplayer-db', 2, {
  upgrade(db, oldVersion) {
    if (oldVersion < 2) {
      if (db.objectStoreNames.contains('playlist')) {
        db.deleteObjectStore('playlist')
      }
      db.createObjectStore('playlist')
    }
  },
})

export async function savePlaylist(items: StoredMedia[]) {
  const db = await dbPromise
  await db.put('playlist', items, 'current-playlist')
}

export async function loadPlaylist(): Promise<StoredMedia[]> {
  const db = await dbPromise
  return (await db.get('playlist', 'current-playlist')) || []
}