const Chat = require('../models/chat.model')
const ApiError = require('../error/api.error')

class ChatService {
  async getAll(userId) {
    const user = await Chat.findOne({ user: userId }).populate('chats.messagesWith')
    let chatsToBeSent = []

    if (user.chats.length > 0) {
      chatsToBeSent = user.chats.map((chat) => ({
        messagesWith: chat.messagesWith._id,
        name: chat.messagesWith.name.firstName + ' ' + chat.messagesWith.name.lastName,
        avatar: chat.messagesWith.avatar,
        lastMessage: chat.messages[chat.messages.length - 1].message,
        date: chat.messages[chat.messages.length - 1].date,
      }))
    }

    return chatsToBeSent
  }

  async deleteChat(userId, messagesWith, next) {
    const user = await Chat.findOne({ user: userId })
    const chatToDelete = user.chats.find((chat) => chat.messagesWith.toString() === messagesWith)

    if (!chatToDelete) {
      return next(ApiError.badRequest('Чат не найден'))
    }

    const indexOf = user.chats.map((chat) => chat.messagesWith.toString()).indexOf(messagesWith)
    user.chats.splice(indexOf, 1)
    await user.save()
  }
}

module.exports = new ChatService()
