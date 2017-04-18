/**
 * @file    共享图书接口路由
 * @author  greenfavo@qq.com
 */
const { getUserInfo } = require('./controls/user-info')
const { addUserCert, cancelUserCert } = require('./controls/cert')
const { getBooks, addBook } = require('./controls/book')
const { addImage } = require('./controls/image')

const routes = function routes (router) {
  // 获取当前用户信息
  router.get('/userinfo', getUserInfo)

  // 用户认证
  router.put('/cert', addUserCert)
  // 取消用户认证
  router.delete('/cert', cancelUserCert)

  // 获取所有图书
  router.get('/books', getBooks)
  // 新建一本图书
  router.put('/book', addBook)

  // 上传图片至七牛
  router.put('/image', addImage)
}

module.exports = routes
