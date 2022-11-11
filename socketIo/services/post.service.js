const Post = require('../../models/post.model')
const User = require('../../models/user.model')
const Notification = require('../../models/notification.model')
const uuid = require('uuid')
const path = require('path')
const Followers = require('../../models/followers.model')
const ApiError = require('../../error/api.error')

const createPost = async (id, text, location, image) => {
  const newPost = {
    user: id,
    text,
  }
  if (location) newPost.location = location
  if (image !== undefined) {
    let fileName = uuid.v4() + '.jpg'
    await image.mv(path.resolve(__dirname, '..', 'static/post', fileName))
    newPost.image = fileName
  }

  const post = await new Post(newPost).save()

  const postCreated = await Post.findById(post._id).populate('user')

  return postCreated
}

const likeOrUnlikePost = async (postId, userId, userToNotifyId, like) => {
  try {
    const post = await Post.findById(postId)
    const userToNotify = await Notification.findOne({ user: userToNotifyId })
    const user = await User.findById(userToNotifyId)

    if (!post) return { error: 'Пост не найден' }

    if (like) {
      const isLiked = post.likes.filter((like) => like.user.toString() === userId).length > 0
      if (isLiked) return { error: 'Вам уже нравится этот пост' }

      const newLike = {
        _id: uuid.v4(),
        user: userId,
      }

      const newNotification = {
        _id: uuid.v4(),
        type: 'newLike',
        user: userId,
        post: postId,
        date: Date.now(),
      }

      await post.likes.unshift(newLike)
      await post.save()

      await userToNotify.notifications.unshift(newNotification)
      if (post.user.toString() !== userId) {
        user.notificationCount += 1
        await user.save()
        await userToNotify.save()
      }

      return { likeId: newLike._id }
    } else {
      const isLiked = post.likes.filter((like) => like.user.toString() === userId).length === 0

      if (isLiked) return { error: 'Вам не нравился этот пост' }

      const indexOf = post.likes.map((like) => like.user.toString()).indexOf(userId)

      post.likes.splice(indexOf, 1)
      if (post.user.toString() !== userId) {
        user.notificationCount -= 1
        await user.save()
        await userToNotify.save()
      }

      await post.save()
    }

    return {
      success: true,
    }
  } catch (error) {
    return { error: 'Ошибка!!!' }
  }
}

const commentPost = async (postId, userId, text) => {
  const post = await Post.findById(postId)

  if (!post) return 'Пост не найден'

  const newComment = {
    _id: uuid.v4(),
    text,
    user: userId,
    date: Date.now(),
  }

  if (post.user.toString() !== userId) {
    await newCommentNotification(postId, newComment._id, userId, post.user.toString(), text)
  }

  await post.comments.unshift(newComment)
  await post.save()

  return { commentId: newComment._id }
}

const newCommentNotification = async (postId, commentId, userId, userToNotifyId, text) => {
  const userToNotify = await Notification.findOne({ user: userToNotifyId })
  const user = await User.findById(userToNotifyId)

  const newNotification = {
    _id: uuid.v4(),
    type: 'newComment',
    user: userId,
    post: postId,
    commentId,
    text,
    date: Date.now(),
  }

  await userToNotify.notifications.unshift(newNotification)
  if (user._id.toString() !== userId) {
    user.notificationCount += 1
    await user.save()
    await userToNotify.save()
  }
}

const getAllPost = async (userId, pageNumber) => {
  const number = Number(pageNumber) | 1
  const size = 8

  let posts

  if (number === 1) {
    posts = await Post.find().limit(size).sort({ createdAt: -1 }).populate('user').populate('comments.user').populate('likes.user')
  } else {
    const skips = size * (number - 1)
    posts = await Post.find()
      .skip(skips)
      .limit(size)
      .sort({ createdAt: -1 })
      .populate('user')
      .populate('comments.user')
      .populate('likes.user')
  }

  let postsToBeSent = []

  const loggedUser = await Followers.findOne({ user: userId })

  if (loggedUser.friends.length === 0) {
    postsToBeSent = posts.filter((post) => post.user._id.toString() === userId)
  } else {
    for (let i = 0; i < loggedUser.friends.length; i++) {
      const foundPostsFromFriends = posts.filter((post) => post.user._id.toString() === loggedUser.friends[i].user.toString())

      if (foundPostsFromFriends.length > 0) postsToBeSent.push(...foundPostsFromFriends)
    }
    const foundOwnPosts = posts.filter((post) => post.user._id.toString() === userId)
    if (foundOwnPosts.length > 0) postsToBeSent.push(...foundOwnPosts)
  }

  postsToBeSent.length > 0 && postsToBeSent.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return postsToBeSent
}

const findPost = async (postId) => {
  const post = await Post.findById(postId).populate('user').populate('comments.user').populate('likes.user')
  return post
}

module.exports = { likeOrUnlikePost, commentPost, createPost, getAllPost, findPost }
