const authService = require('../services/auth.service')
const City = require('../models/cities.model')
const User = require('../models/user.model')
const ApiError = require("../error/api.error");
const bcrypt = require("bcrypt");
const UserDto = require("../dto/user.dto");
const Chat = require("../models/chat.model");
const Code = require("../models/code.model");
const Followers = require("../models/followers.model");
const Notification = require("../models/notification.model");
const tokenService = require("../services/token.service");
const axios = require("axios");
const moment = require('moment')

class AuthController {
  async sendCode(req, res, next) {
    try {
      const {phone} = req.body
      const user = await User.findOne({phone: phone})
      // const code = await axios.get(`https://sms.ru/code/call?phone=${phone}&api_id=${process.env.SMS_API_KEY}`)
      const code = Math.floor(1000 + Math.random() * 9000)

      if (user) {
        const userCode = await Code.findOne({user: user._id})
        if (userCode) {
          if (moment(userCode.updatedAt).add('5', "minutes").format('h:mm:ss') > moment(Date.now()).format('h:mm:ss')) {
            const millis = Math.abs(moment(userCode.updatedAt).add('5', "minutes") - Date.now())
            const minutes = Math.floor(millis / 60000);
            const seconds = ((millis % 60000) / 1000).toFixed(0);
            return next(ApiError.internal(`Повторная отправка возможна через: ${minutes + ":" + (seconds < 10 ? '0' : '') + seconds}`))
          }
          userCode.code = code
          await userCode.save()
          return res.json(user._id)
        } else {
          await Code.create({user: user._id, code: code})
          return res.json(user._id)
        }
      } else {
        const newUser = await User.create({phone})
        const userDto = new UserDto(newUser)

        await new Chat({user: userDto.id, chats: []}).save()
        await new Followers({user: userDto.id, followers: [], following: [], friends: []}).save()
        await new Notification({user: userDto.id, notifications: []}).save()
        await Code.create({user: newUser._id, code: code.data.code})
        return res.json(newUser._id)
      }
    } catch (e) {
      return next(ApiError.unauthorized('ошибка отправки кода'))
    }
  }

  async enterCode(req, res, next) {
    const { code, userId } = req.body
    const findCode = await Code.findOne({ user: userId.toString(), code: code }).populate('user')
    console.log(findCode)

    if (findCode) {
      const userDto = new UserDto(findCode.user)
      const token = tokenService.generateTokens({...userDto})
      await tokenService.saveToken(findCode.user._id, token.accessToken, token.refreshToken)
      res.cookie('refreshToken', token.refreshToken, {
        maxAge: 30 * 86400 * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        signed: true,
      })
      res.cookie('accessToken', token.accessToken, {
        maxAge: 86400,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        signed: true,
      })
      return res.json({ token: token.accessToken })
    } else {
      return res.json({ message: 'Неверный код' })
    }
  }

  async changePassword(req,res,next) {
    const {userId, currentPassword, newPassword, repeatNewPassword} = req.body
    await authService.changePassword(userId,currentPassword,newPassword,repeatNewPassword, res, next)
  }

  async logout(req, res) {
    const { refreshToken } = req.cookies
    await authService.logout(refreshToken)
    res.clearCookie('refreshToken')
    return res.json({ message: 'Выход выполнен' })
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies
      const userData = await authService.refresh(refreshToken, next)
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      })
      return res.json({
        refreshToken: userData.refreshToken,
        accessToken: userData.accessToken,
        user: userData.user,
      })
    } catch (e) {
      next(e)
    }
  }

  async settings(req, res) {
    const { userId, notification } = req.body
    console.log(userId)
    const user = await User.findById(userId)

    if (!user) {
      return 'Пользователь не найден'
    }

    user.settings.notification.messagesToast = notification
    await user.save()

    return res.json('Обновлено')
  }

  async getCity(req, res) {
    const cities = await City.find()
    return res.json(cities)
  }
}

module.exports = new AuthController()
