const express = require('express');
const multer = require('multer')
const fs = require('fs/promises');
const { constants, accessSync } = require('fs');
const path = require('path');
const { handleError } = require('../service/handleError.js');
const filesControllers = require('./controllers.js');
const { checkUser } = require('../middleware/usermiddleware.js');
const { getFileName } = require('../Helpers/filename.js');


const PATH = path.resolve('./public/avatars');



const router = express.Router();

router.use(checkUser);

router.use('/download', express.static(PATH));

module.exports = router;
