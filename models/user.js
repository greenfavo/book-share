/**
 * @file    用户集合模型
 * @author  greenfavo@qq.com
 */

module.exports = {
  verify: false,  // 是否学生认证
  books: [],  // 用户的书的 ID
  borrows: [],  // 借入的书的 ID
  lends: [],  // 借出的书的ID
  score: 100,  // 积分
  proposes: []  // 接收到的借书申请
}
