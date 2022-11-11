const Followers = require('../../models/followers.model')
const UserDto = require('../../dto/user.dto')
const ApiError = require('../../error/api.error')

const friendsRequestGet = async (userId) => {
  const folUser = await Followers.findOne({ user: userId }).populate('following.user')

  if (!folUser) {
    return []
  }

  let followingsUser =
    folUser &&
    folUser.following.map((e) => {
      return new UserDto(e.user)
    })

  return { followingsUser }
}

const friendsGet = async (userId) => {
  const user = await Followers.findOne({ user: userId }).populate('friends.user')

  if (!user) {
    return []
  }

  let friendsUser =
    user &&
    user.friends.map((e) => {
      return new UserDto(e.user)
    })

  return { friendsUser }
}

const friendsUSerInfoGet = async (userId) => {
  const user = await Followers.findOne({ user: userId }).populate('friends.user')

  if (!friendsUSerInfoGet) {
    return []
  }

  let friendsUser =
    user &&
    user.friends.map((e) => {
      return new UserDto(e.user)
    })

  return { friendsUser }
}

const followersGet = async (userId) => {
  const user = await Followers.findOne({ user: userId }).populate('following.user')
  const folUser = await Followers.findOne({ user: userId }).populate('followers.user')

  if (!user) {
    return []
  }

  if (!folUser) {
    return []
  }

  let followingsUser =
    user &&
    user.following.map((e) => {
      return new UserDto(e.user)
    })

  let followersUser =
    folUser &&
    folUser.followers.map((e) => {
      return new UserDto(e.user)
    })

  return { followingsUser, followersUser }
}

const follow = async (userId, userToFollowId) => {
  const user = await Followers.findOne({ user: userId })
  const userToFollow = await Followers.findOne({ user: userToFollowId })

  const isFollowing =
    user.following.length > 0 && user.following.filter((following) => following.user.toString() === userToFollowId).length > 0

  if (isFollowing) {
    return console.log('Пользователь уже в друзьях')
  }

  await user.following.unshift({ user: userToFollowId })
  await user.save()

  await userToFollow.followers.unshift({ user: userId })
  await userToFollow.save()
}

const unfollow = async (userId, userToUnfollowId) => {
  const user = await Followers.findOne({
    user: userId,
  })

  const userToUnfollow = await Followers.findOne({
    user: userToUnfollowId,
  })

  const isFollowing =
    user.following.length > 0 && user.following.filter((following) => following.user.toString() === userToUnfollowId).length === 0

  const removeFollowing = await user.following.map((following) => following.user.toString()).indexOf(userToUnfollowId)

  user.following.splice(removeFollowing, 1)
  await user.save()

  const removeFollower = await userToUnfollow.followers.map((follower) => follower.user.toString()).indexOf(userId)

  userToUnfollow.followers.splice(removeFollower, 1)
  await userToUnfollow.save()
}

const addToFriends = async (userId, userToFriendId) => {
  const user = await Followers.findOne({ user: userId })
  const userToFriend = await Followers.findOne({ user: userToFriendId })

  const isFriend = user.friends.length > 0 && user.friends.filter((following) => following.user.toString() === userToFriendId).length > 0

  if (isFriend) {
    return { userFriends: user.friends }
  }

  await user.friends.unshift({ user: userToFriendId })
  await user.save()

  await userToFriend.friends.unshift({ user: userId })
  await userToFriend.save()

  let userFriends = user.friends

  return { userFriends }
}

const deleteFriend = async (userId, deleteUserId) => {
  const user = await Followers.findOne({ user: userId })
  const userToDelete = await Followers.findOne({ user: deleteUserId })

  const removeFriend = await user.friends.map((friend) => friend.user.toString()).indexOf(deleteUserId)

  user.friends.splice(removeFriend, 1)
  await user.save()

  const removeFriendToUser = await userToDelete.friends.map((friend) => friend.user.toString()).indexOf(userId)

  userToDelete.friends.splice(removeFriendToUser, 1)
  await userToDelete.save()
}

module.exports = { followersGet, follow, unfollow, addToFriends, friendsRequestGet, friendsGet, friendsUSerInfoGet, deleteFriend }
