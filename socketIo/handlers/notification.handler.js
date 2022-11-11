const { getAllNotifications, deleteNotification } = require('../services/notification.service')
const User = require('../../models/user.model')
const UserDto = require('../../dto/user.dto')

module.exports = function notificationHandler(io, socket) {
  socket.on('notification:get', async ({ userId }) => {
    const notification = await getAllNotifications(userId)
    const userDto = new UserDto(notification.user)
    socket.emit('notifications', { _id: notification._id, user: userDto, notifications: notification.notifications })
  })

  socket.on('notifications:countGet', async ({ userId }) => {
    const user = await User.findById(userId)
    socket.emit('notifications:countSuccess', { count: user.notificationCount })
  })

  socket.on('notifications:read', async ({ userId, readNotificationsCount }) => {
    const user = await User.findById(userId)
    if (user) {
      user.notificationCount = user.notificationCount - readNotificationsCount
      await user.save()
    }
    socket.emit('notifications:unread', { count: user.notificationCount })
  })

  socket.on('notification:delete', async ({ userId, notificationId }) => {
    const error = await deleteNotification(userId, notificationId)

    !error && socket.emit('notification:deleted')
  })
}
