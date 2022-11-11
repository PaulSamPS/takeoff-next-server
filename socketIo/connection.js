const userHandlers = require('./handlers/user.handlers')
const messageHandlers = require('./handlers/message.handlers')
const followersHandlers = require('./handlers/followers.handler')
const postHandlers = require('./handlers/post.handler')
const notificationHandlers = require('./handlers/notification.handler')

module.exports = function onConnection(io, socket, users) {
  userHandlers(io, socket, users)

  messageHandlers(io, socket)

  followersHandlers(io, socket)

  postHandlers(io, socket)

  notificationHandlers(io, socket)
}
