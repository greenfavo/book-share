/**
 * @file  微信 JSSDK 相关接口
 * @author  greenfavo@qq.com
 */
const config = require('../../config/wechat')
const Wechat = require('wechat-api')

const api = new Wechat(config.APPID, config.SECRET)

/**
 * 获取 ticket 的 Promise 化
 * @return {Promise} 决议，成功返回相关信息
 */
const getTicket = function getTicket () {
  return new Promise(function getTicketDetail (resolve, reject) {
    api.getTicket(function (err, result) {
      if (err) {
        reject(err)
      }
      resolve(result)
    })
  })
}

/**
 * 获取 JSConfig 的 Promise 化
 * @param  {Object}  参数
 * @return {Promise} 决议，成功返回相关信息
 */
const getJsConfig = function getJsConfig (params) {
  return new Promise(function getJsConfigDetail (resolve, reject) {
    api.getJsConfig(params, function (err, result) {
      if (err) {
        reject(err)
      }
      resolve(result)
    })
  })
}

/**
 * 获取 JS-SDK 相关信息的接口
 * @description 获取 JS-SDK 相关信息的接口
 *              接口地址：GET /api/jssdk
 *              接口参数：url {String} 当前页面的 URL
 * @module wechat
 * @example
 *  {
 *    result: 'ok',
 *    data: {
 *      "appId": "wx2e20dc94b401d6f8",
 *      "timestamp": "1492573508",
 *      "nonceStr": "v4epjonav4864al",
 *      "signature": "067353708ebad4c78bbff6cdcc49c0ed41054b11"
 *    }
 *  }
 * @param  {Object}   ctx  请求与响应上下文
 * @param  {Function} next 下一个迭代器
 */
const getJsSdk = async function getJsSdk (ctx, next) {
  let url = ctx.request.query.url
  try {
    let ticket = await getTicket()
    let params = {
      url: url,
      ticket: ticket.ticket
    }
    console.log(ticket.ticket)
    let config = await getJsConfig(params)
    ctx.response.body = {
      result: 'ok',
      data: config
    }
  } catch (e) {
    ctx.response.body = {
      result: 'fail',
      data: e
    }
  }
}

module.exports = {
  getJsSdk
}
