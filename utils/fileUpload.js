const multer = require('multer')
const path = require('path')
const uuid = require('uuid')
const fs = require('fs')

exports.upload = (folderName) => {
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const path = `static/${folderName}`
        fs.mkdirSync(path, { recursive: true })
        cb(null, `static/${folderName}`)
      },
      filename: (req, file, cb) => {
        cb(null, uuid.v4() + path.extname(file.originalname))
      },
    }),
    limits: { fileSize: '10000000' },
    fileFilter: (req, file, cb) => {
      const fileTypes = /jpeg|jpg|png|gif|svg/
      const mimeType = fileTypes.test(file.mimetype)
      const extname = fileTypes.test(path.extname(file.originalname))

      if (mimeType && extname) {
        return cb(null, true)
      }
      cb('Give proper files format to upload')
    },
  })
}
