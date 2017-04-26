/**
 * @file  微信用户授权
 * @author  greenfavo@qq.com
 */
const path = require('path')
const OAuth = require('wechat-oauth')
const Datastore = require('nedb-promise')
// 个人依赖
const userModel = require('../../models/user')
const wechatConfig = require('../../config/wechat')

// 取出 config.WECHAT 中的配置
const { APPID, SECRET, REDIRECT_URL, STATE, SCOPE } = wechatConfig

// 存取 access_token 的数据库
const tokenDbPath = path.join(__dirname, '../../database/tokens.db')
const tokenDb = new Datastore({ filename: tokenDbPath, autoload: true })
// OAuth 实例化
const client = new OAuth(APPID, SECRET, async function (openid, callback) {
  // 传入一个根据openid获取对应的全局token的方法
  // 在getUser时会通过该方法来获取token
  try {
    let result = tokenDb.findOne({ openid: openid })
    return callback(null, result)
  } catch (error) {
    throw error
  }
}, async function (openid, token, callback) {
  // 持久化时请注意，每个openid都对应一个唯一的token!
  // 有则更新，无则添加
  let query = { openid: openid }
  let options = { upsert: true }
  try {
    await tokenDb.update(query, token, options)
    return callback(null)
  } catch (error) {
    throw error
  }
})

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

      const accessToken = (result && result.data && result.data.access_token) || undefined
      const openid = (result && result.data && result.data.openid) || undefined
      if (accessToken && openid) {
        resolve({ accessToken, openid })
      } else {
        reject(new Error('缺少必要信息'))
      }
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
 * 用户授权认证
 * @param  {Object}   ctx  请求与响应上下文
 * @param  {Function} next 下一个迭代器
 */
const oauth = async function oauth (ctx, next) {
  try {
    const { code, state } = ctx.request.query
    if (code && state) {
      // 此时说明处于用户授权通过，就用 code 获取 openid
      const { openid } = await getAccessToken(code)
      // 通过 openid 获取用户信息
      const userInfo = await getUser(openid)
      // 判断数据库中是否有此用户
      let userData = await ctx.db.users.findOne({ openid: openid })
      if (userData) {
        // 有该用户则更新其微信信息
        await ctx.db.users.update(
          {openid: openid},
          {$set: userInfo}
        )
      } else {
        // 没有该用户则插入用户信息
        userData = await ctx.db.users.insert(Object.assign(
          {},
          userModel,
          userInfo
        ))
      }
      // 将用户 userId 添加到 session
      ctx.session.userId = userData._id
      let options = {
        httpOnly: false,
        overwrite: true
      }
      ctx.cookies.set('userId', userData._id, options)
      ctx.cookies.set('nickname', userData.nickname, options)
      ctx.cookies.set('headimgurl', userData.headimgurl, options)
      ctx.cookies.set('verify', userData.verify, options)
      ctx.cookies.set('score', userData.score, options)
      // 重定向到主页
      ctx.response.redirect('http://sharebook.sevenfan.cn:8080/home')
    } else if (state) {
      // 此时说明用户授权禁止
      ctx.response.body = '请给网页授权才能正常访问'
    } else {
      const url = client.getAuthorizeURL(REDIRECT_URL, STATE, SCOPE)
      ctx.response.redirect(url)
    }
  } catch (e) {
    ctx.response.body = e
  }
}

module.exports = oauth
