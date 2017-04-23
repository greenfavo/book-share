/**
 * @file    发出借阅申请和处理借阅申请的 API
 * @author  greenfavo@qq.com
 */
const config = require('../../config/wechat')
const Wechat = require('wechat-api')

const api = new Wechat(config.APPID, config.SECRET)

/**
 * 向图书主人发起借阅申请的 API
 * @description 接口地址：POST /api/propose/:bookId
 *              接口请求成功返回：{
 *                               result: 'ok',
 *                               data: '请求借阅成功'
 *                             }
 *              接口请求失败返回：{
 *                               result: 'fail',
 *                               data: '请求借阅失败'
 *                             }
 * @param  {Object}   ctx  请求与响应上下文
 * @param  {Function} next 下一个迭代器
 */
const propose = async function propose (ctx, next) {
  try {
    let bookId = ctx.params.bookId
    let borrowUser = await ctx.db.users.findOne({ _id: ctx.session.userId })
    let book = await ctx.db.books.findOne({ _id: bookId })
    // 图书的主人
    let ownerId = book.ownerId
    // 构造图书请求
    let propose = {
      borrowUserId: ctx.session.userId,
      borrowUserName: borrowUser.nickname,
      borrowUserHead: borrowUser.headimgurl,
      borrowBookId: bookId,
      borrowBookName: book.name,
      borrowBookCover: book.cover,
      borrowBookAuthor: book.author,
      date: new Date().getTime(),
      type: '借阅'
    }
    // 更新图书主人的请求列表
    await ctx.db.users.update(
      { '_id': ownerId },
      {
        $push: {
          proposes: propose
        }
      }
    )
    // 获取主人的信息
    let ownerUser = await ctx.db.users.findOne({ _id: ownerId })
    // 发送模版消息
    let templateId = 'ZoqxRrIujE4e-dWTewQG8RDx-0Oi8Kr9LgCOjCRXT20'
    let url = '/home#/notify'
    let data = {
      first: {
        value: '有人想借你的书',
        color: '#000'
      },
      lendUserName: {
        value: borrowUser.nickname,
        color: '#000'
      },
      bookName: {
        value: book.name,
        color: '#000'
      },
      bookAuthor: {
        value: book.author,
        color: '#000'
      },
      end: {
        value: '点击查看详情',
        color: '#000'
      }
    }
    console.log(ownerUser.openid)
    console.log(templateId)
    console.log(url)
    console.log(data)
    api.sendTemplate(ownerUser.openid, templateId, url, data)
    // 返回请求
    ctx.response.body = {
      result: 'ok',
      data: '请求借阅成功'
    }
  } catch (e) {
    ctx.response.body = {
      result: 'fail',
      data: '请求借阅失败'
    }
  }
}

/**
 * 处理借阅请求的 API
 * @description 接口地址：POST /api/apply/:borrowUserId/:borrowBookId
 *              接口请求成功返回：{ result: 'ok', data: '成功借出图书' }
 *              接口请求失败返回：{ result: 'fail', data: '处理借阅请求参数错误' }
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
const apply = async function apply (ctx, next) {
  // 当前用户
  let userId = ctx.session.userId
  // 获取借阅请求的借阅者 ID，图书 ID
  let borrowUserId = ctx.params.borrowUserId
  let borrowBookId = ctx.params.borrowBookId
  // 从用户请求列表中过滤出符合条件的请求
  let user = await ctx.db.users.findOne({ _id: userId })
  let propose = user.proposes.filter(item => {
    return item.borrowUserId === borrowUserId && item.borrowBookId === borrowBookId
  })
  if (propose.length > 0) {
    propose = propose[0]
    // 更新图书状态
    await ctx.db.books.update(
      { _id: propose.borrowBookId },
      { $set: { status: '借出', borrowDate: new Date().getTime() } }
    )
    // 更新借阅者借阅图书
    await ctx.db.users.update(
      { _id: propose.borrowUserId },
      { $push: { borrows: propose.borrowBookId } }
    )
    // 更新用户借出图书
    await ctx.db.users.update(
      { _id: userId },
      {
        $push: { lends: propose.borrowBookId },
        $pull: { proposes: { borrowUserId, borrowBookId } }
      }
    )
    ctx.response.body = {
      result: 'ok',
      data: '成功借出图书'
    }
  } else {
    ctx.response.body = {
      result: 'fail',
      data: '处理借阅请求参数错误'
    }
  }
}

/**
 * 获取当前用户借阅申请信息
 * @description 接口地址：GET /api/proposes
 *              接口请求成功返回：{ result: 'ok', data: Array }
 *              接口请求失败返回：{ result: 'fail', data: '获取用户借阅申请失败' }
 * @param  {Object}   ctx  请求与响应上下文
 * @param  {Function} next 下一个迭代器
 */
const getPropose = async function getPropose (ctx, next) {
  try {
    let userId = ctx.session.userId
    let user = await ctx.db.users.findOne({ _id: userId })
    let proposes = user.messages
    ctx.response.body = {
      result: 'ok',
      data: proposes
    }
  } catch (e) {
    ctx.response.body = {
      result: 'fail',
      data: '获取用户借阅申请失败'
    }
  }
}

module.exports = {
  getPropose,
  propose,
  apply
}
