/**
 * @file    共享图书接口路由
 * @author  greenfavo@qq.com
 */
const { getUserInfo } = require('./controls/user-info')
const { addUserCert, cancelUserCert } = require('./controls/cert')
const { getBooks, addBook, getBookByISBN } = require('./controls/book')
const { addImage } = require('./controls/image')

const routes = function routes (router) {
  // 获取当前用户信息
  router.get('/userinfo', getUserInfo)

  // 用户认证
  router.post('/cert', addUserCert)
  // 取消用户认证
  router.delete('/cert', cancelUserCert)

  // 获取所有图书
  router.get('/books', getBooks)
  // 新建一本图书
  router.post('/book', addBook)
  // 通过 isbn 获取一本书
  router.get('/book/:isbn', getBookByISBN)

  // 上传图片至七牛
  router.post('/image', addImage)
}

module.exports = routes
