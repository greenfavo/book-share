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
  // 将 index.html 渲染出来
  const indexPath = path.join(__dirname, '../index.html')
  ctx.response.body = fs.readFileSync(indexPath).toString()
}

module.exports = home
