const {
  followersGet,
  follow,
  unfollow,
  addToFriends,
  friendsRequestGet,
  friendsGet,
  friendsUSerInfoGet,
  deleteFriend,
} = require('../services/followers.service')

module.exports = function followersHandlers(io, socket) {
  socket.on('followings:get', async ({ userId }) => {
    const { followingsUser, followersUser } = await followersGet(userId)
    socket.emit('followings:sent', { followingsUser, followersUser })
  })

  socket.on('follow', async ({ userId, userToFollowId }) => {
    await follow(userId, userToFollowId)
  })

  socket.on('unfollow', async ({ userId, userToUnfollowId }) => {
    await unfollow(userId, userToUnfollowId)
    const { followingsUser, followersUser } = await followersGet(userId)
    socket.emit('followings:done', { followingsUser, followersUser })
    socket.emit('followersUserInfo:set', { followingsUser })
  })

  socket.on('friendsRequest:get', async ({ userId }) => {
    const { followingsUser } = await friendsRequestGet(userId)
    socket.emit('friendsRequest:sent', { followingsUser })
  })

  socket.on('friends:add', async ({ userId, userToFriendId }) => {
    const { userFriends } = await addToFriends(userId, userToFriendId)
    await unfollow(userId, userToFriendId)
    const { followingsUser, followersUser } = await followersGet(userId)
    socket.emit('followings:done', { followingsUser, followersUser })
    socket.emit('friends:sent', { userFriends })
    socket.emit('followers:addSuccess')
  })

  socket.on('friends:reject', async ({ userId, userToRejectId }) => {
    await unfollow(userId, userToRejectId)
    const { followingsUser, followersUser } = await followersGet(userId)
    socket.emit('followings:done', { followingsUser, followersUser })
    socket.emit('friends:rejectSuccess')
  })

  socket.on('friends:get', async ({ userId }) => {
    const { friendsUser } = await friendsGet(userId)
    socket.emit('friends:set', { friendsUser })
  })

  socket.on('friendsUserInfo:get', async ({ userId }) => {
    const { friendsUser } = await friendsUSerInfoGet(userId)
    socket.emit('friendsUserInfo:set', { friendsUser })
  })

  socket.on('followersUserInfo:get', async ({ userId }) => {
    const { followingsUser } = await followersGet(userId)
    console.log(followingsUser)
    socket.emit('followersUserInfo:set', { followingsUser })
  })

  socket.on('friends:delete', async ({ userId, deleteUserId }) => {
    await deleteFriend(userId, deleteUserId)
    socket.emit('friends:deleteSuccess')
  })
}
