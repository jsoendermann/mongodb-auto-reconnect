import { Db, MongoClient } from 'mongodb'

export default (mongoUrl: string): (() => Promise<Db>) => {
  let dbPromise: Promise<Db> | null = null

  return (): Promise<Db> => {
    if (dbPromise) {
      return dbPromise
    }

    dbPromise = MongoClient.connect(mongoUrl)
      .then((db: Db) => {
        if (!db) {
          dbPromise = null
          throw new Error('db is falsy')
        }

        db.on('error', () => {
          dbPromise = null
        })
        db.on('close', () => {
          dbPromise = null
        })

        return db
      })
      .catch(error => {
        dbPromise = null
        return Promise.reject(error)
      })
    return dbPromise
  }
}
