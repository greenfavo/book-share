/**
 * @file    共享图书接口路由
 * @author  greenfavo@qq.com
 */
const { getUserInfo } = require('./controls/user-info')

const routes = function routes (router) {
  router.get('/userinfo', getUserInfo)
}

module.exports = routes
