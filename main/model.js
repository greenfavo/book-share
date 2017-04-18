/**
 * @file  数据库模型
 * @author  greenfavo@qq.com
 */

const user = {
  verify: false,  // 是否学生认证
  book: [],  // 用户的书的 ID
  borrow: [],  // 借入的书的 ID
  lend: [],  // 借出的书的ID
  score: 100  // 积分
}

module.exports = {
  user
}
