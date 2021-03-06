export type GetDb<DB> = () => Promise<DB>

interface MongoClientInstance<DB> {
  db: (dbName: string) => DB
  connect: (callback: (err: Error) => void) => void
}
export interface MongoClient<DB> {
  new (url: string, options: { autoReconnect: boolean }): MongoClientInstance<
    DB
  >
}

export default function <DB>(
  mongoClientClass: MongoClient<DB>,
  mongoUrl: string,
  dbName: string
): GetDb<DB> {
  const client = new mongoClientClass(mongoUrl, {
    autoReconnect: true,
  })

  let isConnectedToDb = false

  return () =>
    new Promise((res, rej) => {
      if (isConnectedToDb) {
        res(client.db(dbName))
      } else {
        client.connect(err => {
          if (err) {
            rej(err)
          } else {
            isConnectedToDb = true
            res(client.db(dbName))
          }
        })
      }
    })
}
