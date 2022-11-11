const { Schema, model } = require('mongoose')

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },

  notifications: [
    {
      _id: { type: String, required: true },
      type: {
        type: String,
        enum: ['newLike', 'newComment', 'newFollower'],
      },
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      post: { type: Schema.Types.ObjectId, ref: 'Post' },
      commentId: { type: String },
      text: { type: String },
      date: { type: Date, default: Date.now },
    },
  ],
})

module.exports = model('Notification', NotificationSchema)
