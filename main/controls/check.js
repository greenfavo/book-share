/**
 * @file  微信接入验证
 * @author  greenfavo@qq.com
 */
const wechat = require('wechat')
const wechatConfig = require('../../config/wechat')

const { TOKEN } = wechatConfig

const check = function check (ctx, next) {
  const { timestamp, nonce, signature, echostr } = ctx.request.query
  const check = wechat.checkSignature({ timestamp, nonce, signature }, TOKEN)
  if (check) {
    ctx.response.body = echostr
  } else {
    ctx.response.body = false
  }
}

module.exports = check
