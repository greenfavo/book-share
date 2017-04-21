/**
 * @file    用户集合模型
 * @author  greenfavo@qq.com
 */

module.exports = {
  // 默认有 _id
  // 主要内容
  verify: false,  // 是否学生认证
  books: [],  // 用户的书的 ID
  borrows: [],  // 借入的书的 ID
  lends: [],  // 借出的书的ID
  score: 100,  // 积分
  proposes: [],  // 接收到的借书申请
  // 微信的信息
  openid: '',
  nickname: '',
  sex: 1,
  language: '',
  city: '',
  province: '',
  country: '',
  headimgurl: '',
  privilege: null
}
