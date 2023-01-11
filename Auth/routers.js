const express = require('express');
const userControl = require('./controllers.js');
const { checkUser } = require('../middleware/usermiddleware.js');

const router = express.Router();

router.post('/signup', userControl.userRegistration);

router.get('/login', userControl.userLogin);

router.get('/current', checkUser, userControl.getInfoCurrentUser);

router.patch ('/users', checkUser, userControl.updateSubscription);

module.exports = router;
