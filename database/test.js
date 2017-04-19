const Datastore = require('nedb-promise')
let db = {}
db.users = new Datastore({ filename: './database/users.db', autoload: true })
db.books = new Datastore({ filename: './database/books.db', autoload: true })

async function init () {
  let result = await db.users.findOne({})
  console.log(result)
}

init()
