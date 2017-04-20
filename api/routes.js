/**
 * @file    共享图书接口路由
 * @author  greenfavo@qq.com
 */
const { getJsSdk } = require('./controls/wechat')
const { getUserInfo } = require('./controls/user-info')
const { addUserCert, cancelUserCert } = require('./controls/cert')
const { getBooks, addBook, getBookByISBN, searchBooks } = require('./controls/book')
const { addImage } = require('./controls/image')
const { propose } = require('./controls/propose')

const routes = function routes (router) {
  // JSSDK 验证
  router.get('/jssdk', getJsSdk)
  // 获取当前用户信息
  router.get('/userinfo', getUserInfo)

  // 用户认证
  router.post('/cert', addUserCert)
  // 取消用户认证
  router.delete('/cert', cancelUserCert)

  // 获取所有图书
  router.get('/books', getBooks)
  router.get('/books/:keyword', searchBooks)
  // 新建一本图书
  router.post('/book', addBook)
  // 通过 isbn 获取一本书
  router.get('/isbn/:isbn', getBookByISBN)
  // 发出借阅图书申请
  router.post('/propose/:bookId', propose)

  // 添加一个评论
  router.post('/comment')

  // 上传图片至七牛
  router.post('/image', addImage)
}

module.exports = routes
