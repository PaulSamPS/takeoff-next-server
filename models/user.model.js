const { Schema, model } = require('mongoose')

const UserSchema = new Schema(
  {
    name: {
      firstName: { type: String },
      lastName: { type: String },
    },
    phone: { type: String, unique: true, required: true, sparse: true},
    role: { type: String, default: 'user' },
    avatar: { type: String, default: null },
    lastVisit: { type: Date, default: null },
    notificationCount: { type: Number, default: 0 },
    bio: {
      birthday: {
        day: { type: Number },
        month: { type: String },
        year: { type: Number },
      },
      city: { type: String },
      language: { type: String },
      gender: { type: String },
      familyStatus: { type: String },
    },
    settings: {
      notification: {
        messagesToast: { type: Boolean, default: true },
      },
    },
  },
  { timestamps: true }
)

UserSchema.index({ 'name.firstName': 'text', 'name.lastName': 'text' })

module.exports = model('User', UserSchema)
