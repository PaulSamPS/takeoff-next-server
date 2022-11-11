const { Schema, model } = require('mongoose')

const PostSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },

    text: { type: String },

    location: { type: String },

    image: { type: String, default: null },

    likes: [
      {
        _id: { type: String, required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],

    comments: [
      {
        _id: { type: String, required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

module.exports = model('Post', PostSchema)
