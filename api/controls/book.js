/**
 * @file  和图书相关的接口
 * @author  greenfavo@qq.com
 */
const request = require('request')
const bookModel = require('../../models/book')

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
      const result = await ctx.db.books.insert(Object.assign(
        {},
        bookModel,
        {
          ISBN: ctx.request.body.ISBN,
          name: ctx.request.body.name,
          author: ctx.request.body.author,
          translator: ctx.request.translator,
          publish: ctx.request.body.publish,
          summary: ctx.request.body.summary,
          cover: ctx.request.body.cover,
          area: ctx.request.body.area,
          date: new Date().getTime(),
          ownerId: userId
        }
      ))
      // 更新用户的图书集合
      await ctx.db.users.update(
        { _id: userId },
        { $push: { books: result._id } }
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
    ctx.response.contentType = 'application/json'
    ctx.response.body = {
      result: 'ok',
      data: bookMsg
    }
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
    let books = await ctx.db.books.cfind({ date: { $lt: timestamp } }).sort({ date: -1 }).limit(10).exec()
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
 * 用户未借阅的图书接口
 * @description 接口地址：GET /api/books/user/:userId
 * @param {Object} ctx 请求和响应上下文
 * @param {Function} next 下一个迭代器
 */
const getUserBooks = async function getUserBooks (ctx, next) {
  let userId = ctx.params.userId
  let type = ctx.request.query.type

  try {
    if (type === 'borrow') {
      // 查询用户借阅的书
      let user = await ctx.db.users.findOne({ _id: userId })
      // 借阅的书的 ID
      let borrows = user.borrows
      let books = await ctx.db.books.find(
        { _id: { $in: borrows } }
      )
      ctx.response.body = {
        result: 'ok',
        data: books
      }
    } else if (type === 'lend') {
      // 查询用户借出的书
      let books = await ctx.db.books.find(
        { ownerId: userId, status: '借出' }
      )
      ctx.response.body = {
        result: 'ok',
        data: books
      }
    } else {
      // 查询用户的未借阅的书
      let books = await ctx.db.books.find(
        { ownerId: userId, status: '可借' }
      )
      ctx.response.body = {
        result: 'ok',
        data: books
      }
    }
  } catch (error) {
    ctx.response.body = {
      result: 'fail',
      data: '查询数据库出现问题'
    }
  }
}

/**
 * 获取一本书的接口
 * @description 接口地址：GET /api/book
 *              接口请求成功返回：{ result: 'ok', data: book }
 *              接口请求失败返回：{ result: 'fail', data: '查询数据库出现问题' }
 * @param {*} ctx  请求与响应上下文
 * @param {*} next 下一个迭代器
 */
const getBook = async function getBook (ctx, next) {
  try {
    let bookId = ctx.request.query.bookId
    let book = await ctx.db.books.findOne({
      _id: bookId
    })
    let user = await ctx.db.users.findOne({
      _id: book.ownerId
    })
    let userMsg = {
      ownerName: user.nickname,
      headimgurl: user.headimgurl
    }
    ctx.response.body = {
      result: 'ok',
      data: Object.assign(
        {},
        userMsg,
        book
      )
    }
  } catch (error) {
    ctx.response.body = {
      result: 'fail',
      data: '查询数据库出现问题'
    }
  }
}

/**
 * 搜索图书的接口
 * @description 接口地址：GET /api/books/:keyword
 *              接口请求成功返回：{ result: 'ok', data: books }
 *              接口请求失败返回：{ result: 'fail', data: String }
 * @param  {Object}   ctx  请求与响应的上下文
 * @param  {Function} next 下一个迭代器
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
    ctx.response.body = {
      result: 'fail',
      data: '查询数据库错误'
    }
  }
}

/**
 * 添加评论的接口
 * @description 接口地址：POST /api/comment
 *              接口参数：bookId {String} 书的ID
 *                      content {String} 评论内容
 *              接口请求成功返回：{ result: 'ok', data: '添加评论成功' }
 *              接口请求失败返回：{ result: 'fail', data: '添加评论失败' }
 * @param {Object} ctx 请求与响应上下文
 * @param {Function} next 下一个迭代器
 */
const addComment = async function addComment (ctx, next) {
  let { bookId, content } = ctx.request.body
  try {
    // 获取当前用户的信息
    let user = await ctx.db.users.findOne({ _id: ctx.session.userId })
    // 更新图书的评论
    let comment = {
      userId: user._id,
      userName: user.nickname,
      headimgurl: user.headimgurl,
      content: content,
      date: new Date().getTime()
    }
    await ctx.db.books.update(
      { _id: bookId },
      {
        $push: {
          comments: comment
        }
      }
    )
    ctx.response.body = {
      result: 'ok',
      data: comment
    }
  } catch (e) {
    ctx.response.body = {
      result: 'fail',
      data: '添加评论失败'
    }
  }
}

module.exports = {
  addBook,
  addComment,
  searchBooks,
  getBookByISBN,
  getBooks,
  getUserBooks,
  getBook
}
