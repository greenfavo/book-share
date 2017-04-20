/**
 * @file    后台主文件
 * @author  greenfavo@qq.com
 */
const path = require('path')
const Koa = require('koa')
const Router = require('koa-better-router')
const body = require('koa-body')
const Datastore = require('nedb-promise')
const serve = require('koa-static')
const session = require('koa-session')

const general = require('./libs/general')
const mainRoutes = require('./main/routes')
const apiRoutes = require('./api/routes')
const adminRoutes = require('./admin/routes')
const { PORT, HOST, SESSION } = require('./config')

const usersDbPath = path.join(__dirname, 'database/users.db')
const booksDbPath = path.join(__dirname, 'database/books.db')

let app = new Koa()
let db = {}
db.users = new Datastore({ filename: usersDbPath, autoload: true })
db.books = new Datastore({ filename: booksDbPath, autoload: true })

app.keys = [SESSION.key]

// 路由设置器
let mainRouter = Router().loadMethods()
let apiRouter = Router({ prefix: '/api' }).loadMethods()
let adminRouter = Router({ prefix: '/admin' }).loadMethods()

// 路由启用
mainRoutes(mainRouter)
apiRoutes(apiRouter)
adminRoutes(adminRouter)

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    // will only respond with JSON
    ctx.status = err.statusCode || err.status || 500
    ctx.body = {
      message: err.message
    }
  }
})
// 将 db 加入 ctx 中
app.use(async (ctx, next) => {
  ctx.db = db
  await next()
})
app.use(body({multipart: true}))
// session
app.use(session(SESSION, app))
// 静态服务
app.use(serve(path.join(__dirname, '/main/dist')))
app.use(general)
// 路由加入到中间件
app.use(mainRouter.middleware())
app.use(apiRouter.middleware())
app.use(adminRouter.middleware())

// 启动服务器
app.listen(PORT, HOST, () => console.log('服务器启动在' + PORT + '端口'))
