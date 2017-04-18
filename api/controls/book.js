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

      console.log(body)
      resolve(body)
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
  if (ctx.session.openid) {
    try {
      await ctx.db.books.insert({
        ISBN: ctx.request.body.ISBN,
        name: ctx.request.body.name,
        author: ctx.request.body.author,
        publish: ctx.request.body.publish,
        publishDate: ctx.request.body.publish_date,
        summary: ctx.request.body.summary,
        cover: ctx.request.body.cover || 'http://img.baidu.com',
        ownerId: ctx.session.openid
      })
      ctx.response.body = JSON.stringify({
        result: 'ok',
        data: '插入物品信息成功'
      })
    } catch (e) {
      ctx.response.body = JSON.stringify({
        result: 'fail',
        data: '插入物品信息失败'
      })
    }
  } else {
    ctx.response.body = JSON.stringify({
      result: 'fail',
      data: '用户未登录'
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

// const getBooks = function getBooks (ctx, next) {
//   if (ctx.session.openid) {
//     try {
//       let books = ctx.db.books.find()
//     } catch (e) {
//
//     }
//   } else {
//     ctx.response.body = JSON.stringify({
//       result: 'fail',
//       data: '用户未登录'
//     })
//   }
// }

module.exports = {
  addBook,
  getBookByISBN
}
