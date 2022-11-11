const { loadMessages, sendMsg, setMsgToUnread, deleteMessage, setMsgRead } = require('../services/message.service')
const { findConnectedUser } = require('../services/room.service')
const chatService = require('../../services/chat.service')
const Chat = require('../../models/chat.model')

module.exports = function messageHandlers(io, socket) {
  socket.on('messages:get', async ({ userId, messagesWith, pageNumber }) => {
    const { chat, error } = await loadMessages(userId, messagesWith, pageNumber)
    !error ? socket.emit('message_list:update', { chat }) : socket.emit('chat:notFound')
  })

  socket.on('message:add', async ({ _id, sender, receiver, message }) => {
    const { newMessage, error } = await sendMsg(_id, sender, receiver, message)
    const receiverSocket = await findConnectedUser(receiver)

    if (receiverSocket) {
      io.to(receiverSocket.socketId).emit('message:received', { newMessage })
    } else {
      await setMsgToUnread(sender, receiver)
    }
    !error && socket.emit('messages:sent', { newMessage })
  })

  socket.on('message:toUnread', async ({ receiver, sender }) => {
    await setMsgToUnread(sender, receiver)
  })

  socket.on('message:read', async ({ userId, msgSendToUserId }) => {
    await setMsgRead(msgSendToUserId, userId)
  })

  socket.on('chat:get', async ({ userId }) => {
    const user = await Chat.findOne({ user: userId }).populate('chats.messagesWith')
    let chatsToBeSent = []

    if (user.chats.length > 0) {
      chatsToBeSent = user.chats.map((chat) => ({
        messagesWith: chat.messagesWith._id,
        name: chat.messagesWith.name.firstName + ' ' + chat.messagesWith.name.lastName,
        avatar: chat.messagesWith.avatar,
        lastVisit: chat.messagesWith.lastVisit,
        lastMessage: chat.messages[chat.messages.length - 1].message,
        date: chat.messages[chat.messages.length - 1].date,
        countUnreadMessages: chat.countUnreadMessages,
      }))
    }
    socket.emit('chat:send', { chatsToBeSent })
  })

  socket.on('message:delete', async ({ userId, messagesWith, messageId }) => {
    const { success } = await deleteMessage(userId, messagesWith, messageId)

    if (success) socket.emit('message:deleted')
  })
}
