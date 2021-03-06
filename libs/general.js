/**
 * @file    请求上下文通用处理
 * @author  greenfavo@qq.com
 */
const OAuth = require('wechat-oauth')
const config = require('../config')
const wechatConfig = require('../config/wechat')

// 取出 config.WECHAT 中的配置
const { APPID, SECRET, REDIRECT_URL, STATE, SCOPE } = wechatConfig

// OAuth 实例化
const client = new OAuth(APPID, SECRET)

const general = async function general (ctx, next) {
  let urlPath = ctx.request.path
  if (urlPath === '/' || urlPath === '/oauth' || ctx.session.userId) {
    await next()
  } else if (~config.ROUTES.indexOf(urlPath)) {
    const url = client.getAuthorizeURL(REDIRECT_URL, STATE, SCOPE)
    ctx.response.redirect(url)
  } else {
    await next()
  }
}

module.exports = general
