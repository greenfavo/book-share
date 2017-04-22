/**
 * @file    脚本修复
 * @author  greenfavo@qq.com
 */
const path = require('path')
const Datastore = require('nedb-promise')

const fix = function fix () {
  const booksDbPath = path.join(__dirname, '../database/books.db')

  let db = {}
  db.books = new Datastore({ filename: booksDbPath, autoload: true })

  db.books.update({}, {$set: {status: '可借'}}, {multi: true})
}

fix()