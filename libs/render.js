/**
 * @file    读取 HTML 文件
 * @author  greenfavo@qq.com
 */
const fs = require('fs')

const render = function render (ctx, path) {
  const content = fs.readFileSync(path)
  ctx.response.body = content
}

module.exports = render
