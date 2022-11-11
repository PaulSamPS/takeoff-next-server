const Followers = require('../models/followers.model')
const ApiError = require('../error/api.error')
const FollowersUserDto = require('../dto/followerrsUser.dto')

class FollowersController {
  async folow(req, res, next) {
    try {
      const { userId } = req.body
      const { userToFollowId } = req.params

      const user = await Followers.findOne({ user: userId })
      const userToFollow = await Followers.findOne({ user: userToFollowId })

      if (!user || !userToFollow) {
        next(ApiError.badRequest('Пользователь не найден'))
      }

      const isFollowing =
        user.following.length > 0 && user.following.filter((following) => following.user.toString() === userToFollowId).length > 0

      if (isFollowing) {
        next(ApiError.badRequest('Пользователь уже в друзьях'))
      }

      await user.following.unshift({ user: userToFollowId })
      await user.save()

      await userToFollow.followers.unshift({ user: userId })
      await userToFollow.save()

      return res.status(200).send('Обновлено')
    } catch (error) {
      console.error(error)
      return next(ApiError.forbidden('Что-то пошло не так'))
    }
  }

  async unfollow(req, res, next) {
    try {
      const { userId } = req.body
      const { userToUnfollowId } = req.params

      const user = await Followers.findOne({
        user: userId,
      })

      const userToUnfollow = await Followers.findOne({
        user: userToUnfollowId,
      })

      if (!user || !userToUnfollow) {
        next(ApiError.badRequest('Пользователь не найден'))
      }

      const isFollowing =
        user.following.length > 0 && user.following.filter((following) => following.user.toString() === userToUnfollowId).length === 0

      if (isFollowing) {
        next(ApiError.badRequest('Пользователь не был подписан'))
      }

      const removeFollowing = await user.following.map((following) => following.user.toString()).indexOf(userToUnfollowId)

      user.following.splice(removeFollowing, 1)
      await user.save()

      const removeFollower = await userToUnfollow.followers.map((follower) => follower.user.toString()).indexOf(userId)

      userToUnfollow.followers.splice(removeFollower, 1)
      await userToUnfollow.save()

      return res.status(200).send('Обновлено')
    } catch (error) {
      console.error(error)
      return next(ApiError.forbidden('Что-то пошло не так'))
    }
  }

  async followers(req, res, next) {
    try {
      const { userId } = req.params

      const user = await Followers.findOne({ user: userId }).populate('followers.user')

      const followersUser = user.followers.map((e) => {
        return new FollowersUserDto(e.user)
      })

      return res.json(followersUser)
    } catch (error) {
      console.error(error)
      return next(ApiError.forbidden('Что-то пошло не так'))
    }
  }

  async followings(req, res, next) {
    try {
      const { userId } = req.params

      const user = await Followers.findOne({ user: userId }).populate('following.user')

      const followingsUser = user.following.map((e) => {
        return new FollowersUserDto(e.user)
      })

      return res.json(followingsUser)
    } catch (error) {
      console.error(error)
      return next(ApiError.forbidden('Что-то пошло не так'))
    }
  }
}

module.exports = new FollowersController()
