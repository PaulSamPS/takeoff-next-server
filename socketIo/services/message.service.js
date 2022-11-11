const Chat = require('../../models/chat.model')

const loadMessages = async (userId, messagesWith) => {
  try {
    const user = await Chat.findOne({ user: userId }).populate('chats.messagesWith')
    const chat = user.chats.find((chat) => chat.messagesWith._id.toString() === messagesWith)

    if (!chat) {
      return { error: 'Чат не найден' }
    }

    return { chat }
  } catch (error) {
    console.log(error)
    return { error }
  }
}

const sendMsg = async (_id, userId, msgSendToUserId, message) => {
  try {
    const user = await Chat.findOne({ user: userId })
    const msgSendToUser = await Chat.findOne({ user: msgSendToUserId })

    let newMessage = {
      _id,
      sender: userId,
      receiver: msgSendToUserId,
      message,
      date: Date.now(),
    }

    const previousChat = user.chats.find((chat) => chat.messagesWith.toString() === msgSendToUserId)

    if (previousChat) {
      previousChat.messages.push(newMessage)
      await user.save()
    }
    //
    else {
      const newChat = { messagesWith: msgSendToUserId, messages: [newMessage] }
      user.chats.unshift(newChat)
      await user.save()
    }

    const previousChatForReceiver = msgSendToUser.chats.find((chat) => chat.messagesWith.toString() === userId)

    if (previousChatForReceiver) {
      previousChatForReceiver.messages.push(newMessage)
      await msgSendToUser.save()
    }
    //
    else {
      const newChat = { messagesWith: userId, messages: [newMessage] }
      msgSendToUser.chats.unshift(newChat)
      await msgSendToUser.save()
    }

    return { newMessage }
  } catch (error) {
    console.error(error)
    return { error }
  }
}

const setMsgToUnread = async (sender, receiver) => {
  try {
    const user = await Chat.findOne({ user: receiver }).populate('chats.messagesWith')
    const chatTo = user.chats.find((chat) => chat.messagesWith._id.toString() === sender)

    chatTo.countUnreadMessages += 1
    await user.save()
  } catch (error) {
    console.error(error)
  }
}

const setMsgRead = async (userId, msgSendToUserId) => {
  try {
    const user = await Chat.findOne({ user: msgSendToUserId }).populate('chats.messagesWith')
    const chatTo = user.chats.find((chat) => chat.messagesWith._id.toString() === userId)

    if (chatTo) {
      chatTo.countUnreadMessages = 0
      await user.save()
    }
  } catch (error) {
    console.error(error)
  }
}

const deleteMessage = async (userId, messagesWith, messageId) => {
  try {
    const user = await Chat.findOne({ user: userId })
    const chat = user.chats.find((chat) => chat.messagesWith.toString() === messagesWith)

    if (!chat) return

    const messageToDelete = chat.messages.find((message) => message._id.toString() === messageId)
    if (!messageToDelete) return

    if (messageToDelete.sender.toString() !== userId) {
      return
    }

    const indexOf = chat.messages.map((message) => message._id.toString()).indexOf(messageToDelete._id.toString())
    chat.messages.splice(indexOf, 1)

    await user.save()

    return { success: true }
  } catch (error) {
    console.log(error)
  }
}

module.exports = { loadMessages, sendMsg, setMsgToUnread, deleteMessage, setMsgRead }
