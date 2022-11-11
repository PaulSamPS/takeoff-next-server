const Router = require('express')
const router = new Router()
const postController = require('../controllers/post.controller')
const { upload } = require('../utils/fileUpload')

router.post('/create', upload('post').single('image'), postController.create)
router.post('/delete/:postId', postController.deletePost)

module.exports = router
