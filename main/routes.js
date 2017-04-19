/**
 * @file    共享图书应用路由
 * @author  greenfavo@qq.com
 */
const home = require('./controls/home')
const check = require('./controls/check')
const oath = require('./controls/oath')

const routes = function routes (router) {
  // 微信接入验证
  router.get('/', check)
  router.get('/oath', oath)
  router.get('/home', home)
}

module.exports = routes
