const User = require('../../models/user.model')
let users = []

const addUser = async (userId, socketId) => {
  const user = users.find((user) => user.userId === userId)

  if (user && user.socketId === socketId) {
    return users
  } else {
    if (user && user.socketId !== socketId) {
      await removeUser(user.socketId)
    }
    const newUser = { userId, socketId }
    users.push(newUser)

    return users
  }
}

const removeUser = async (socketId) => {
  const indexOf = users.map((user) => user.socketId).indexOf(socketId)
  const lastVisitUser = users.find((user) => user.socketId === socketId)
  const lastVisit = await User.findById(lastVisitUser && lastVisitUser.userId)
  if (lastVisit) {
    lastVisit.lastVisit = Date.now()
    lastVisit.isOnline = false
    lastVisit.save()
  }
  users.splice(indexOf, 1)
}

const getUser = async (userId) => {
  const user = await User.findById(userId)
  if (!user) {
    return {error: true}
  }
  return { user }
}

const findConnectedUser = (userId) => users.find((user) => user.userId === userId)

module.exports = { addUser, removeUser, findConnectedUser, getUser }
