const Notification = require('../../models/notification.model')

const getAllNotifications = async (userId) => {
  const notifications = await Notification.findOne({ user: userId })
    .populate('user')
    .populate('notifications.user')
    .populate('notifications.post')
  if (!notifications) return 'Нет оповещений'

  return notifications
}

const deleteNotification = async (userId, notificationId) => {
  const notification = await Notification.findOne({ user: userId })

  if (!notification) {
    return { error: 'Уведомление не найдено' }
  }

  const indexOf = notification.notifications.map((notification) => notification._id.toString()).indexOf(notificationId.toString())
  notification.notifications.splice(indexOf, 1)

  await notification.save()
}

module.exports = { getAllNotifications, deleteNotification }
