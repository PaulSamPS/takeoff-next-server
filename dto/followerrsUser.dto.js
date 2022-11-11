module.exports = class UserDto {
  id
  name
  avatar
  position
  lastVisit
  isOnline
  constructor(model) {
    this.id = model.id
    this.name = model.name
    this.avatar = model.avatar
    this.position = model.position
    this.lastVisit = model.lastVisit
    this.isOnline = model.isOnline
  }
}
