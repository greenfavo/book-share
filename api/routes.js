/**
 * @file    共享图书接口路由
 * @author  greenfavo@qq.com
 */
const { getJsSdk } = require('./controls/wechat')
const { getUserInfo } = require('./controls/user-info')
const { addUserCert, cancelUserCert } = require('./controls/cert')
const { getBooks, getUserBooks, getBook, addBook, deleteBook, getBookByISBN, searchBooks, addComment } = require('./controls/book')
const { addImage } = require('./controls/image')
const { propose, getPropose, apply } = require('./controls/propose')
const { generteMessage, processMessage, getBookStatus } = require('./controls/message')

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

  // 获取某个用户的所有图书
  router.get('/books/user/:userId', getUserBooks)

  // 新建一本图书
  router.post('/book', addBook)
  // 获取一本书
  router.get('/book', getBook)
  router.delete('/book/:bookId', deleteBook)
  // 通过 isbn 获取一本书
  router.get('/isbn/:isbn', getBookByISBN)
  // 发出借阅图书申请
  router.post('/propose/:bookId', propose)
  // 获取借阅列表
  router.get('/proposes', getPropose)
  // 处理借阅
  router.post('/apply/:borrowUserId/:borrowBookId', apply)

  // 添加一个评论
  router.post('/comment', addComment)

  // 上传图片至七牛
  router.post('/image', addImage)

  router.post('/message', generteMessage)
  router.post('/message/process', processMessage)
  router.get('/bookstatus/:bookId/:userId', getBookStatus)
}

module.exports = routes
