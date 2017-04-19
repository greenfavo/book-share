/**
 * @file    请求上下文通用处理
 * @author  greenfavo@qq.com
 */
const OAuth = require('wechat-oauth')
const wechatConfig = require('../config/wechat')

// 取出 config.WECHAT 中的配置
const { APPID, SECRET, REDIRECT_URL, STATE, SCOPE } = wechatConfig

// OAuth 实例化
const client = new OAuth(APPID, SECRET)

const general = async function general (ctx, next) {
  let urlPath = ctx.request.path
  console.log(urlPath)
  console.log(ctx.session.userId)
  if (urlPath === '/' || urlPath === '/oauth' || ctx.session.userId) {
    next()
  } else {
    const url = client.getAuthorizeURL(REDIRECT_URL, STATE, SCOPE)
    ctx.response.redirect(url)
  }
}

module.exports = general
