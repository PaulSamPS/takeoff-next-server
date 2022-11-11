const Router = require('express')
const router = new Router()
const followersController = require('../controllers/followers.controller')
const auth = require('../middleware/auth.middleware')

router.post('/follow/:userToFollowId', followersController.folow)
router.put('/unfollow/:userToUnfollowId', followersController.unfollow)
router.get('/followers/:userId', followersController.followers)
router.get('/followings/:userId', followersController.followings)

module.exports = router
