const Post = require('../models/post.model')
const Notification = require('../models/notification.model')
const ApiError = require('../error/api.error')
const path = require('path')
const fs = require('fs')
const sharp = require('sharp')

class PostController {
  async create(req, res, next) {
    const { id, text, location } = req.body
    const image = req.file

    try {
      const newPost = {
        user: id,
        text: text ? text : null,
      }
      if (location) newPost.location = location
      if (image) {
        await sharp(req.file.path)
          .resize(540, 310)
          .jpeg({ quality: 100 })
          .toFile(path.resolve(req.file.destination, '540x310', req.file.filename))
        fs.unlinkSync(req.file.path)
        newPost.image = image.filename
      }

      const post = await new Post(newPost).save()

      const postCreated = await Post.findById(post._id).populate('user')

      return res.json(postCreated)
    } catch (error) {
      console.error(error)
      return next(ApiError.badRequest('Что-т пошло не так'))
    }
  }

  async deletePost(req, res, next) {
    const { postId } = req.params
    const { userId, image } = req.body

    const post = await Post.findByIdAndDelete(postId)

    if (!post) {
      return next(ApiError.badRequest('Пост не найден'))
    }

    if (image !== null && image !== undefined) {
      fs.unlink(path.resolve(__dirname, '..', 'static/post/540x310', image), function (err) {
        if (err) throw err
        console.log('Файл удален')
      })
    }

    const userNotifications = await Notification.findOne({ user: userId })
    await Notification.updateOne({ _id: userNotifications._id }, { $pull: { notifications: { post: postId } } })

    return res.json('Пост удалён')
  }
}

module.exports = new PostController()
