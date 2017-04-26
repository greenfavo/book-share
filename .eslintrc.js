/**
 * @file    eslint 配置
 * @author  greenfavo@qq.com
 */

module.exports = {
  // 强制所有文件都遵循此规则
  root: true,
  // 加入 ES6 解析
  parser: 'babel-eslint',
  // 规则
  extends: 'standard',
  plugins: ['mocha'],
  rules: {
    "mocha/no-exclusive-tests": "error"
  }
}
