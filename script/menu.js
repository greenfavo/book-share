/**
 * @file    开启自定义菜单
 * @author  greenfavo@qq.com
 */
const config = require('../config/wechat')
const menu = require('../config/menu')
const Wechat = require('wechat-api')

const api = new Wechat(config.APPID, config.SECRET)

api.getAccessToken(function (err, token) {
  if (err) {
    console.log(err)
  }

  api.createMenu(menu, function (err, result) {
    if (err) {
      console.log(err)
    }
    console.log(result)
  })
})
