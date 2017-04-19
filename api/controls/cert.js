/**
 * @file  用户认证相关接口
 * @author  greenfavo@qq.com
 */
const request = require('request')

/**
 * 学生账号认证，如果是本校学生则返回 true，否则返回 false
 * @param  {Function}  next 执行下一个函数
 * @return {Generator}      是否是学生的决议
 */
const verify = function verify (ctx) {
  const username = ctx.request.body.username
  const password = ctx.request.body.password

  return new Promise(function (resolve, reject) {
    request.post({
      url: 'http://ids.scuec.edu.cn/amserver/UI/Login',
      form: {
        IDToken0: '',
        IDToken1: username,
        IDToken2: password,
        IDButton: 'Submit',
        goto: 'aHR0cDovL215LnNjdWVjLmVkdS5jbi9pbmRleC5wb3J0YWw=',
        encoded: 'true',
        gx_charset: 'UTF-8'
      }
    }, function (err, response, body) {
      if (err) {
        reject(err)
      }

      const code = response.statusCode
      /**
       * 如果请求返回的状态码是 302，则说明该账号是有效的
       * 如果请求返回的状态码是 200，则说明该账号是无效的
       * @param  {String} code === '302'        账号有效的条件
       */
      if (code === '302') {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

/**
 * 学生认证
 * @description 接口地址：POST /api/cert
 *              接口请求成功返回：{result: 'ok', data: '学生认证成功'}
 *              接口请求失败返回：{result: 'fail', data: String}
 * @param {Object}   ctx  请求与响应的上下文
 * @param {Function} next 下一个迭代器
 */
const addUserCert = async function addUserCert (ctx, next) {
  let userId = ctx.session.userId
  try {
    let isPass = await verify(ctx)
    if (isPass) {
      // 设置用户的 verify 字段为 true
      await ctx.db.users.update(
        { _id: userId },
        { $set: { verify: true } }
      )
      ctx.response.body = JSON.stringify({
        result: 'ok',
        data: '学生认证成功'
      })
    } else {
      ctx.response.body = JSON.stringify({
        result: 'fail',
        data: '学生认证失败'
      })
    }
  } catch (e) {
    ctx.response.body = JSON.stringify({
      result: 'fail',
      data: '学生认证出错'
    })
  }
}

/**
 * 取消用户认证接口
 * @description 接口地址：DELETE /api/cert
 *              接口请求成功返回：{result: 'ok', data: '取消用户认证成功'}
 *              接口请求失败返回：{result: 'fail', data: String}
 * @param  {Object}   ctx  请求与响应上下文
 * @param  {Function} next 下一个迭代器
 */
const cancelUserCert = async function cancelUserCert (ctx, next) {
  let userId = ctx.session.userId
  try {
    await ctx.db.users.update(
      { _id: userId },
      { $set: { verify: false } }
    )
    ctx.response.body = JSON.stringify({
      result: 'ok',
      data: '取消用户认证成功'
    })
  } catch (e) {
    ctx.response.body = JSON.stringify({
      result: 'fail',
      data: '取消用户认证错误'
    })
  }
}

module.exports = {
  addUserCert,
  cancelUserCert
}
