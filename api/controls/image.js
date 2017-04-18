/**
 * @file  和图片有关的接口
 * @author  greenfavo@qq.com
 */
const fs = require('fs')
const qiniu = require('qiniu')
const config = require('../../config/qiniu.js')

/**
 * 生成上传 Token
 * @param  {String} bucket  上传的空间
 * @param  {String} key     文件名
 * @param  {String} saveKey 处理后的文件名
 * @return {String}         Token
 */
function uptoken (bucket, key, saveKey) {
  let fops = 'imageMogr2/auto-orient/gravity/Center/format/webp'
  let putPolicy = new qiniu.rs.PutPolicy(`${bucket}:${key}`)
  let saveAsKey = qiniu.util.urlsafeBase64Encode(`${bucket}:${saveKey}`)

  fops = `${fops}|saveas/${saveAsKey}`
  putPolicy.persistentOps = fops

  return putPolicy.token()
}

/**
 * 上传文件
 * @param  {String} prefix   文件前缀
 * @param  {String} key      文件名
 * @param  {String} filepath 文件缓存地址
 * @return {Promise}         决议
 */
const uploadFile = function uploadFile ({prefix, key, filepath}) {
  let saveKey = `${prefix}.webp`
  let token = uptoken(config.BUCKET, key, saveKey) // 生成上传token

  return new Promise((resolve, reject) => {
    let extra = new qiniu.io.PutExtra()
    qiniu.io.putFile(token, key, filepath, extra, function (err, ret) {
      fs.unlink(filepath) // 从临时文件夹删除
      if (err) {
        reject(err)
      }
      resolve({
        url: qiniu.rs.makeBaseUrl(config.DOMAIN, ret.key),
        webpUrl: qiniu.rs.makeBaseUrl(config.DOMAIN, saveKey)
      })
    })
  })
}

/**
 * @description POST /image  上传图片
 * @module image
 * @see controls/image
 * @param {Binary} file - 二进制文件
 * @return {object} 上传返回的json
 * @example {
 *  "result": "ok",
 *  "url": "http://onzj7fisz.bkt.clouddn.com/1491715501999.jpg",
 *  "webpUrl": "http://onzj7fisz.bkt.clouddn.com/1491715501999.webp"
 *  }
 */
const addImage = async function addImage (ctx, next) {
  try {
    const files = ctx.request.body.files
    console.log(files)
    console.log(ctx.request.body)
    const { filepath, filename } = files.file
    /**
     * 文件扩展名
     * @type {String}
     */
    const extension = filename.substring(filename.lastIndexOf('.'))
    const prefix = new Date().getTime()
    const key = prefix + extension

    const result = await uploadFile({prefix, key, filepath})
    ctx.response.body = {
      result: 'ok',
      data: {
        url: result.url,
        webpUrl: result.webpUrl
      }
    }
  } catch (e) {
    ctx.response.body = {
      result: 'fail',
      data: e
    }
  }
}

module.exports = {
  addImage
}
