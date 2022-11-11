const Router = require('express')
const router = new Router()

const authRouter = require('./auth.router')
const userRouter = require('./user.router')
const chatRouter = require('./chat.router')
const followRouter = require('./followers.router')
const postRouter = require('./post.router')

router.use('/auth', authRouter)
router.use('/user', userRouter)
router.use('/chat', chatRouter)
router.use('/followers', followRouter)
router.use('/post', postRouter)

module.exports = router
