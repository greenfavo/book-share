/**
 * @file  和图书相关的接口
 * @author  greenfavo@qq.com
 */
const request = require('request')

/**
 * 通过 ISBN 从豆瓣获取图书信息
 * @param  {String} isbn ISBN
 * @return {Promise}     决议
 */
const getBookFromDouban = function getBookFromDouban (isbn) {
  return new Promise(function (resolve, reject) {
    request({
      url: 'https://api.douban.com/v2/book/isbn/' + isbn
    }, function (err, response, body) {
      if (err) {
        reject(err)
      }

      resolve(JSON.parse(body))
    })
  })
}

/**
 * 增加图书的接口
 * @description 接口地址：POST /api/book
 *              接口请求成功返回信息：{result: 'ok', data: '插入物品信息成功'}
 *              接口请求失败返回信息：{result: 'fail', data: '插入物品信息失败'}
 * @param {Object}   ctx  请求与响应上下文
 * @param {Function} next 下一个迭代器
 */
const addBook = async function addBook (ctx, next) {
  try {
    let userId = ctx.session.userId
    let book = await ctx.db.books.findOne(
      {
        ownerId: userId,
        ISBN: ctx.request.body.ISBN
      }
    )
    if (book) {
      ctx.response.body = JSON.stringify({
        result: 'fail',
        data: '该书已存在'
      })
    } else {
      const result = await ctx.db.books.insert({
        ISBN: ctx.request.body.ISBN,
        name: ctx.request.body.name,
        author: ctx.request.body.author,
        publish: ctx.request.body.publish,
        publishDate: ctx.request.body.publishDate,
        summary: ctx.request.body.summary,
        cover: ctx.request.body.cover,
        area: ctx.request.body.area,
        date: new Date().getDate(),
        ownerId: userId
      })
      // 更新用户的图书集合
      await ctx.db.users.update(
        { _id: userId },
        { $push: { book: result._id } }
      )
      ctx.response.body = JSON.stringify({
        result: 'ok',
        data: '插入物品信息成功'
      })
    }
  } catch (e) {
    ctx.response.body = JSON.stringify({
      result: 'fail',
      data: '插入物品信息失败'
    })
  }
}

/**
 * 通过ISBN返回图书信息
 * @param  {Object}   ctx  请求与响应上下文
 * @param  {Function} next 下一个迭代器
 */
const getBookByISBN = async function getBookByISBN (ctx, next) {
  let isbn = ctx.params.isbn
  try {
    let bookMsg = await getBookFromDouban(isbn)
    ctx.response.body = JSON.stringify({
      result: 'ok',
      data: bookMsg
    })
  } catch (e) {
    ctx.response.body = JSON.stringify({
      result: 'fail',
      data: '请求图书信息出错'
    })
  }
}

/**
 * 获取所有图书的接口
 * @description 接口地址：GET /api/books
 *              接口参数：timestamp（可选）
 *              接口请求成功返回：{ result: 'ok', data: books }（有书）
 *                             { result: 'fail', data: '没有更多图书了'}（无书）
 *              接口请求失败返回：{ result: 'fail', data: errMsg }
 * @param  {Object}   ctx  请求与响应上下文
 * @param  {Function} next 下一个迭代器
 */
const getBooks = async function getBooks (ctx, next) {
  try {
    let timestamp = +(ctx.request.query.timestamp) || new Date().getTime() + 1000
    let books = await ctx.db.books.find({ date: { $lt: timestamp } }).sort({ date: -1 }).limit(20)
    if (books) {
      ctx.response.body = {
        result: 'ok',
        data: books
      }
    } else {
      ctx.response.body = {
        result: 'fail',
        data: '没有更多图书了'
      }
    }
  } catch (e) {
    ctx.response.body = {
      result: 'fail',
      data: '查询数据库出现问题'
    }
  }
}

/**
 * [searchBooks description]
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
const searchBooks = async function searchBooks (ctx, next) {
  const keyword = ctx.params.keyword
  try {
    let books = await ctx.db.books.find(
      {
        $or: [
          {name: {$regex: new RegExp(keyword)}},
          {author: {$regex: new RegExp(keyword)}}
        ]
      }
    )
    if (books) {
      ctx.response.body = {
        result: 'ok',
        data: books
      }
    } else {
      ctx.response.body = {
        result: 'fail',
        data: '没有符合条件的书'
      }
    }
  } catch (e) {

  }
}

module.exports = {
  addBook,
  searchBooks,
  getBookByISBN,
  getBooks
}
