/**
 * @file  首页的请求逻辑
 * @author  greenfavo@qq.com
 */
const path = require('path')
// 第三方库
const wechat = require('wechat')
const OAuth = require('wechat-oauth')
// 个人依赖
const render = require('../../libs/render')
const wechatConfig = require('../../config/wechat')

// 取出 config.WECHAT 中的配置
const { APPID, SECRET, REDIRECT_URL, STATE, SCOPE, TOKEN } = wechatConfig

// OAuth 实例化
const client = new OAuth(APPID, SECRET)

/**
 * 获取 accessToken Promise 化
 * @param  {String} code code
 * @return {Promise}     返回决议
 */
const getAccessToken = function getAccessToken (code) {
  return new Promise(function getAccessTokenDetail (resolve, reject) {
    client.getAccessToken(code, function (err, result) {
      if (err) {
        reject(err)
      }

      const accessToken = result.data.access_token
      const openid = result.data.openid
      resolve({ accessToken, openid })
    })
  })
}

/**
 * 获取用户信息 Promise 化
 * @param  {String} openid openid
 * @return {Promise}       返回决议
 */
const getUser = function getUser (openid) {
  return new Promise(function getUserDetail (resolve, reject) {
    client.getUser(openid, function (err, result) {
      if (err) {
        reject(err)
      }
      resolve(result)
    })
  })
}

/**
 * 首页主要逻辑
 * @param  {Object}   ctx  HTTP 上下文对象
 * @param  {Function} next 下一个迭代器
 */
const main = async function main (ctx, next) {
  // 获取请求的参数
  const { code, state, timestamp, nonce, signature, echostr } = ctx.request.query ? ctx.request.query : {}
  if (code && state) {
    // 此时说明处于用户授权通过，就用 code 获取 openid
    const { openid } = await getAccessToken(code)
    // 通过 openid 获取用户信息
    const userInfo = await getUser(openid)
    console.log(userInfo)
    // 渲染首页
    render(ctx, path.join(__dirname, '../dist/index.html'))
  } else if (state) {
    // 此时说明用户授权禁止
    ctx.response.body = '请给网页授权才能正常访问'
  } else if (timestamp && nonce && signature) {
    // 接入验证
    const check = wechat.checkSignature({ timestamp, nonce, signature }, TOKEN)
    if (check) {
      ctx.response.body = echostr
    } else {
      ctx.response.body = false
    }
  } else {
    // 用户授权之前来到主页
    // 生成用户引导 URL 并重定向
    const url = client.getAuthorizeURL(REDIRECT_URL, STATE, SCOPE)
    ctx.response.redirect(url)
  }
}

module.exports = main
