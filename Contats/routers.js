const express = require('express')
const {handleError}= require('../service/handleError.js')
const contactsHandlers = require('./controllers.js')
const {checkUser} = require('../middleware/usermiddleware.js')

const router = express.Router();

router.use(checkUser);

router.get('/?', handleError(contactsHandlers.listContacts));

router.get('/:contactId', handleError(contactsHandlers.getContactById));

router.post('/', handleError(contactsHandlers.addContact));

router.delete('/:contactId', handleError(contactsHandlers.removeContact));

router.put('/:contactId', handleError(contactsHandlers.updateContact));

router.patch('/:contactId/favorite', handleError(contactsHandlers.updateStatusContact));

router.get('*', contactsHandlers.notPatch);

module.exports = router;
