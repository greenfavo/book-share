/**
 * @file  首页的请求逻辑
 * @author  greenfavo@qq.com
 */
// 原生库
const path = require('path')
const fs = require('fs')

/**
 * 首页主要逻辑
 * @param  {Object}   ctx  HTTP 上下文对象
 * @param  {Function} next 下一个迭代器
 */
const home = async function home (ctx, next) {
  let userId = ctx.session.userId
  if (userId) {
    console.log('userId', userId)
    try {
      let userData = await ctx.db.users.findOne({ _id: userId })
      console.log('userData', userData)
      let options = {
        httpOnly: false
      }
      if (userData) {
        ctx.cookies.set('userId', userData._id, options)
        ctx.cookies.set('nickname', userData.nickname, options)
        ctx.cookies.set('headimgurl', userData.headimgurl, options)
        ctx.cookies.set('verify', userData.verify, options)
        ctx.cookies.set('score', userData.score, options)
      } else {
        console.log('数据库中不存在该用户')
      }
    } catch (error) {
      console.log('数据库查询失败', error)
    }
  } else {
    console.log('session 不存在')
  }
  // 将 index.html 渲染出来
  const indexPath = path.join(__dirname, '../index.html')
  ctx.response.body = fs.readFileSync(indexPath).toString()
}

module.exports = home
