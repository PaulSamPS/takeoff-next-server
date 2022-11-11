const Router = require('express')
const router = new Router()
const authController = require('../controllers/auth.controller')
const auth = require('../middleware/auth.middleware')

router.post('/send-code', authController.sendCode)
router.post('/enter-code', authController.enterCode)
router.post('/logout', authController.logout)
router.post('/settings', authController.settings)
router.post('/change-password', authController.changePassword)
router.get('/refresh', authController.refresh)
router.get('/cities', authController.getCity)

module.exports = router
