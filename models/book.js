/**
 * @file    图书数据库模型
 * @author  greenfavo@qq.com
 */

module.exports = {
  // 默认有 _id
  _id: '',
  // 主要内容
  ISBN: '',
  name: '',
  author: '',
  publish: '',
  summary: '',
  cover: '',
  area: '',
  date: '',
  comments: [],
  ownerId: ''  // 图书所有者 ID
}