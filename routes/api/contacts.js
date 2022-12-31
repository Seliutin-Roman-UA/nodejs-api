const express = require('express')
const {handleError}= require('../../service/handleError.js')
const contactsHandlers = require('../../models/contacts.js')

const router = express.Router()

router.get('/', handleError(contactsHandlers.listContacts));


router.get('/:contactId', handleError(contactsHandlers.getContactById));

router.post('/', handleError(contactsHandlers.addContact));

router.delete('/:contactId', handleError(contactsHandlers.removeContact));

router.put('/:contactId', handleError(contactsHandlers.updateContact));

router.patch('/:contactId/favorite', handleError(contactsHandlers.updateStatusContact));

router.get('*', contactsHandlers.notPatch);

module.exports = router;
