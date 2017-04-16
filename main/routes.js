/**
 * @file    共享图书应用路由
 * @author  greenfavo@qq.com
 */
const home = require('./controls/home')

const routes = function routes (router) {
  // 首页路由请求
  router.get('/', home)
}

module.exports = routes
