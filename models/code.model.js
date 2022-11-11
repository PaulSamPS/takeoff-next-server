const { Schema, model } = require('mongoose')

const CodeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    code: { type: String },
  },
  { timestamps: true }
)

module.exports = model('Code', CodeSchema)
