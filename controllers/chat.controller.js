const User = require('../models/user.model')
const ApiError = require('../error/api.error')
const UserDto = require('../dto/user.dto')
const chatService = require('../services/chat.service')
const Chat = require('../models/chat.model')
const {json} = require("express");

class ChatController {
  async getAll(req, res, next) {
    try {
      const { userId } = req.params
      const chatsToBeSent = await chatService.getAll(userId)

      return res.json(chatsToBeSent)
    } catch (error) {
      return next(ApiError.internal(error))
    }
  }

  async getChatUser(req, res, next) {
    try {
      const { id } = req.params
      const user = await User.findById({ _id: id })

      if (!user) {
        return next(ApiError.badRequest('Пользователь не найден'))
      }
      const userDto = new UserDto(user)

      return res.json({ user: userDto })
    } catch (error) {
      return next(ApiError.internal(error))
    }
  }

  async deleteChat(req, res, next) {
    try {
      const { userId } = req.body
      const { messagesWith } = req.params

      await chatService.deleteChat(userId, messagesWith, next)

      return res.status(200).send('Чат удалён')
    } catch (error) {
      return next(ApiError.internal(error))
    }
  }

  async getUnreadMessages(req, res) {
    const { id } = req.params
    const userChats = await Chat.findOne({ user: id }).populate('chats.messagesWith')
    let chatsToBeSent = []

    if (userChats.chats.length > 0) {
      chatsToBeSent = userChats.chats.map((chat) => ({
        messagesWith: chat.messagesWith._id,
        name: chat.messagesWith.name,
        avatar: chat.messagesWith.avatar,
        lastMessage: chat.messages[chat.messages.length - 1].message,
        date: chat.messages[chat.messages.length - 1].date,
        countUnreadMessages: chat.countUnreadMessages,
      }))
    }
    return res.json(chatsToBeSent)
  }

  async setMessageUnread(req, res) {
    const { withId } = req.params
    const { id } = req.body
    const user = await Chat.findOne({ user: withId }).populate('chats.messagesWith')
    const chatTo = user.chats.find((chat) => chat.messagesWith._id.toString() === id)

    chatTo.countUnreadMessages += 1
    await user.save()
  }

  async messagesRead(req, res) {
    const { withId } = req.params
    const { id } = req.body
    const user = await Chat.findOne({ user: withId }).populate('chats.messagesWith')
    const chatTo = user.chats.find((chat) => chat.messagesWith._id.toString() === id)

    chatTo.countUnreadMessages = 0
    await user.save()
  }
}

module.exports = new ChatController()
