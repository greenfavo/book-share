const request = require('supertest')
const server = require('../app')

describe('路由请求是否成功', function () {
  const agent = request.agent(server)

  it('获取一本书', function () {
    agent
    .get('/api/book?bookId=VgkgoeqrBVGcjBCM')
    .expect(200)
    .then((res) => console.log(res))
  })

  it('获取一个用户的书', function () {
    agent
    .get('/api/books/user/5JUxBOpO7iP7qFhR')
    .expect(200)
    .then(res => console.log(res))
  })

  it('获取用户的信息', function () {
    agent
    .get('／api/user-info?userId=5JUxBOpO7iP7qFhR')
    .expect(200)
    .then(res => console.log(res))
  })
})