import { openDB, type DBSchema } from 'idb'

interface MyDB extends DBSchema {
  playlist: {
    key: string
    value: File[]
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

export async function savePlaylist(files: File[]) {
  const db = await dbPromise
  await db.put('playlist', files, 'current-playlist')
}

export async function loadPlaylist(): Promise<File[]> {
  const db = await dbPromise
  return (await db.get('playlist', 'current-playlist')) || []
}