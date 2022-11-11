const { likeOrUnlikePost, commentPost, getAllPost, findPost } = require('../services/post.service')

module.exports = function postHandler(io, socket) {
  socket.on('post:get', async ({ userId, pageNumber }) => {
    const posts = await getAllPost(userId, pageNumber)
    socket.emit('post:send', { posts })
  })

  socket.on('like:post', async ({ postId, userId, userToNotifyId, like }) => {
    const { likeId } = await likeOrUnlikePost(postId, userId, userToNotifyId, like)
    socket.emit('post:liked', { likeId })
  })

  socket.on('comment:post', async ({ postId, userId, text }) => {
    const { commentId } = await commentPost(postId, userId, text)
    socket.emit('post:commented', { commentId })
  })

  socket.on('post:find', async ({ postId }) => {
    const post = await findPost(postId)
    socket.emit('post:findSuccess', { post })
  })
}
