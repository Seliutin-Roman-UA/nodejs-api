const express = require('express');
const multer = require('multer');
const path = require('path');
const userControl = require('./controllers.js');
const { checkUser } = require('../middleware/usermiddleware.js');
const { getFileName } = require('../Helpers/filename.js');
var Jimp = require('jimp');

const PATH_AVATAR = path.resolve('./public/avatars');
const PATH_TMP = path.resolve('./tmp');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, PATH_TMP)
  },
  filename: function (req, file, cb) {   
    cb(null, getFileName(req, file.originalname, PATH_AVATAR)); 
  } 
})

const upload = multer({ storage: storage }); 

router.post('/signup', userControl.userRegistration);

router.get('/verify/:verificationToken', userControl.verificateToken);

router.post('/verify', userControl.verificateEmail);

router.get('/login', userControl.userLogin);

router.get('/current', checkUser, userControl.getInfoCurrentUser);

router.patch('/users', checkUser, userControl.updateSubscription);

router.patch('/avatar', checkUser, upload.single('avatar'),
    (req, res, next) => {
        req.file.newpath = path.join(PATH_AVATAR, req.file.filename);
        Jimp.read(req.file.path)
            .then(handledfile => {
                return handledfile
                        .resize(250, 250)
                        .write(req.file.path);
            })
        next();
    },
    userControl.updateAvatar);

module.exports = router;
