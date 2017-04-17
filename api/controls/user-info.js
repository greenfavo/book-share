/**
 * @file    用户信息相关的接口逻辑
 * @author  greenfavo@qq.com
 */

/**
 * 获取当前用户信息的接口
 * @description 接口地址： GET ‘／api/user-info’
 *              接口请求成功返回：{errCode: 0, data: Object}
 *              接口失败返回：{errCode: Number, errMsg: String}
 * @param  {Object}   ctx  请求与相应上下文
 * @param  {Function} next 下一个迭代器
 */
const getUserInfo = function getUserInfo (ctx, next) {
  if (ctx.session.userInfo) {
    ctx.response.body = JSON.stringify({
      errCode: 0,
      data: ctx.session.userInfo
    })
  } else {
    ctx.response.body = JSON.stringify({
      errCode: 300,
      errMsg: '用户未登录'
    })
  }
}

module.exports = {
  getUserInfo
}
