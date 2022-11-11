const Router = require('express')
const router = new Router()
const chatController = require('../controllers/chat.controller')

router.get('/:userId', chatController.getAll)
router.get('/user/:id', chatController.getChatUser)
router.get('/user-chats/:id', chatController.getUnreadMessages)
router.delete('/:messagesWith', chatController.deleteChat)
router.post('/messages-read/:withId', chatController.messagesRead)
router.post('/messages-unread/:withId', chatController.setMessageUnread)

module.exports = router
