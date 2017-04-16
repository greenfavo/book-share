/**
 * @file    后台主文件
 * @author  greenfavo@qq.com
 */
const Koa = require('koa')
const Router = require('koa-better-router')

const mainRoutes = require('./main/routes')
const apiRoutes = require('./api/routes')
const adminRoutes = require('./admin/routes')
const { PORT } = require('./config')

let app = new Koa()

// 路由设置器
let mainRouter = Router().loadMethods()
let apiRouter = Router({ prefix: '/api' }).loadMethods()
let adminRouter = Router({ prefix: '/admin' }).loadMethods()

// 路由启用
mainRoutes(mainRouter)
apiRoutes(apiRouter)
adminRoutes(adminRouter)

// 路由加入到中间件
app.use(mainRouter.middleware())
app.use(apiRouter.middleware())
app.use(adminRouter.middleware())

// 启动服务器
app.listen(PORT, () => console.log('服务器启动在' + PORT + '端口'))
