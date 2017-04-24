/**
 * @file  消息接口
 * @author  greenfavo@qq.com
 */
const config = require('../../config/wechat')
const Wechat = require('wechat-api')

const api = new Wechat(config.APPID, config.SECRET)

let messageMap = {
  '借阅': '有人想借你的书',
  '借阅申请': '你的借阅申请正在等待处理中',
  '还书': '有人还了你的书',
  '还书申请': '你的还书申请正在等待处理中',
  '还书审核': '是否已还书',
  '还书审核申请': '正在审核是否还书',
  '评论': '有人评论了你'
}

/**
 * 发送模版消息
 * @param {String} openid openId
 * @param {Object} data 消息数据
 */
const postTemplateMessage = function postTemplateMessage (openid, data) {
  let templateId = 'bHShR6gfyCI-qhj8Ur90efhcupUdH1MUdRODkvE3Xos'
  let url = 'http://sharebook.sevenfan.cn:8080/home#/notify'
  if (data.url) {
    url = data.url
    delete data.url
  }
  // 处理 data
  let keys = Object.keys(data)
  let newValues = keys.map(function (key) {
    return {
      value: data[key],
      color: '#000'
    }
  })
  let newData = {}
  for (let i = 0; i < keys.length; i++) {
    newData[keys[i]] = newValues[i]
  }
  api.sendTemplate(openid, templateId, url, newData)
}

/**
 * 发送消息的接口
 * @description 接口地址：POST /api/message
 * @param organizerId {String} 发起人的 ID 可选，默认为当前用户
 * @param receiverId {String} 接收人的 ID
 * @param type {String} 消息类型
 * @param content {String} 消息内容
 * @param bookId {String} 关联的书的 ID
 */
const generteMessage = async function generteMessage (ctx, next) {
  let { organizerId, receiverId, bookId, type, content } = ctx.request.body
  organizerId = organizerId || ctx.session.userId
  let messageType = type

  try {
    // 查找消息发起者的用户信息
    let organizer = await ctx.db.users.findOne({ _id: organizerId })
    // 查找消息接收者的用户信息
    let receiver = await ctx.db.users.findOne({ _id: receiverId })
    // 查找关联图书信息
    let book = await ctx.db.books.findOne({ _id: bookId })
    // 构建消息接收者的模版消息
    let data = {
      first: messageMap[type],
      lendUserName: organizer.nickname,
      bookName: book.name,
      bookAuthor: book.author,
      end: '点击查看详情'
    }

    if (messageType === '评论') {
      data.url = 'http://sharebook.sevenfan.cn:8080/home#/book/' + bookId
    } else {
      // 其他评论双方都要接收
      // 1. 构建发起者信息对象
      let organizerMessage = {
        bookId,
        book,
        organizerId,
        receiverId,
        organizer,
        receiver,
        content,
        type: type + '申请',
        title: messageMap[type + '申请'],
        date: new Date().getTime()
      }
      // 2. 构建接收者信息对象
      let receiverMessage = Object.assign(
        {},
        organizerMessage,
        {
          type,
          title: messageMap[type]
        }
      )
      // 3. 将发起者信息对象插入至发起者用户信息里
      await ctx.db.users.update(
        { _id: organizerId },
        { $push: { messages: organizerMessage } }
      )
      // 4. 将接收者信息对象插入至接收者用户信息里
      await ctx.db.users.update(
        { _id: receiverId },
        { $push: { messages: receiverMessage } }
      )
    }

    // 发送模版消息给接收者
    postTemplateMessage(receiver.openid, data)

    // 成功返回的内容
    ctx.response.body = {
      result: 'ok',
      data: '消息发送成功'
    }
  } catch (error) {
    ctx.response.body = {
      result: 'fail',
      data: error
    }
  }
}

/**
 * 处理消息的接口
 * @description 接口地址：POST /api/message/process
 * @param {String} bookId 消息关联图书 ID
 * @param {String} organizerId 消息发起者 ID
 * @param {String} receiverId 消息接收者 ID
 * @param {String} type 消息类型
 * @param {String} date 消息产生日期
 * @param {String} reply 消息事务操作 true false
 */
const processMessage = async function processMessage (ctx, next) {
  let { bookId, organizerId, receiverId, type, date, reply } = ctx.request.body
  try {
    if (reply === 'true') {
      let organizer = await ctx.db.users.findOne({ _id: organizerId })
      let receiver = await ctx.db.users.findOne({ _id: receiverId })
      let book = await ctx.db.books.findOne({ _id: bookId })
      if (type === '借阅') {
        // 1. 发起者成功 borrow 一本书
        await ctx.db.users.update(
          { _id: organizerId },
          { $push: { borrows: bookId } }
        )
        // 2. 图书状态改变
        await ctx.db.books.update(
          { _id: bookId },
          { $set: { status: '借出' } }
        )
        // 3. 接收者成功 lend 一本书
        await ctx.db.users.update(
          { _id: receiverId },
          { $push: { lends: bookId } }
        )
        // 发送模版消息告诉发起者成功借阅
        let data = {
          first: '你的书借阅成功了',
          lendUserName: receiver.nickname,
          bookName: book.name,
          bookAuthor: book.author,
          end: '点击查看详情',
          url: 'http://sharebook.sevenfan.cn:8080/home#/shelf'
        }
        postTemplateMessage(organizer.openid, data)
      } else if (type === '还书') {
        // 1. 发起者成功将 lends 弹出
        await ctx.db.users.update(
          { _id: organizerId },
          { $pull: { lends: bookId } }
        )
        // 2. 图书状态改变
        await ctx.db.books.update(
          { _id: bookId },
          { $set: { status: '可借' } }
        )
        // 3. 接收者成功将 borrows 弹出
        await ctx.db.users.update(
          { _id: receiverId },
          { $pull: { borrows: bookId } }
        )
        // 发送模版消息告诉发起者成功还书
        let data = {
          first: '书已还好',
          lendUserName: receiver.nickname,
          bookName: book.name,
          bookAuthor: book.author,
          end: '点击查看详情',
          url: 'http://sharebook.sevenfan.cn:8080/home#/shelf'
        }
        postTemplateMessage(organizer.openid, data)
      } else if (type === '还书审核') {
        // 1. 接收者积分加十
        await ctx.db.users.update(
          { _id: receiverId },
          { $set: { score: receiver.score + 10 } }
        )
        // 2. 发起者积分加十
        await ctx.db.users.update(
          { _id: organizerId },
          { $set: { score: organizer.score + 10 } }
        )
      }
    } else {
      let organizer = await ctx.db.users.findOne({ _id: organizerId })
      let book = await ctx.db.books.findOne({ _id: bookId })      
      if (type === '还书审核') {
        // 1. 发起者积分减十
        await ctx.db.users.update(
          { _id: organizerId },
          { $set: { score: organizer.score - 10 } }
        )
      } else if (type === '借阅') {
        // 发送模版消息告诉发起者拒绝借阅
        let data = {
          first: '图书主人拒绝借书',
          lendUserName: organizer.nickname,
          bookName: book.name,
          bookAuthor: book.author,
          end: '点击查看详情',
          url: ''
        }
        postTemplateMessage(organizer.openid, data)
      }
    }

    // 无论是什么消息，即便 reply 不为 true，都删掉
    // 1. 删除发起者的消息
    await ctx.db.users.update(
      { _id: organizerId },
      { $pull: { messages: { organizerId, receiverId, date } } }
    )
    // 2. 删除接收者的消息
    await ctx.db.users.update(
      { _id: receiverId },
      { $pull: { messages: { organizerId, receiverId, date } } }
    )
    ctx.response.body = {
      result: 'ok',
      data: '消息已处理'
    }
  } catch (error) {
    ctx.response.body = {
      result: 'ok',
      data: '消息处理失败'
    }
  }
}

/**
 * 获取图书状态的接口
 * @description 接口地址：GET /api/bookstatus/:bookId/:userId
 * @param {String} bookId 图书ID
 * @param {String} userId 用户ID，默认是当前用户
 */
const getBookStatus = async function getBookStatus (ctx, next) {
  let bookId = ctx.params.bookId
  let userId = ctx.params.userId || ctx.session.userId
  try {
    let user = await ctx.db.users.findOne({ _id: userId })
    let messages = user.messages
    // 找出发起者是用户自己并且有那本书的消息
    let bookMessages = messages.filter(message => {
      return message.bookId === bookId && message.organizerId === userId
    })
    if (bookMessages.length) {
      let result
      let bookMessage = bookMessages[0]
      switch (bookMessage.type) {
        case '借阅申请':
          result = '本书正在借阅中'
          break
        case '还书申请':
          result = '本书正在归还中'
          break
        default:
          result = ''
      }
      ctx.response.body = {
        result: 'ok',
        data: result
      }
    } else {
      ctx.response.body = {
        result: 'fail',
        data: '本书处于正常状态'
      }
    }
  } catch (error) {
    ctx.response.body = {
      result: 'fail',
      data: error
    }
  }
}

module.exports = {
  generteMessage,
  processMessage,
  getBookStatus
}
