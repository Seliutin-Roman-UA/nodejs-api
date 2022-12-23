const express = require('express')
const contactsHandlers = require('../../models/contacts.js')

const router = express.Router()

router.get('/', contactsHandlers.listContacts);

router.get('/:contactId', contactsHandlers.getContactById);

router.post('/', contactsHandlers.addContact);

router.delete('/:contactId', contactsHandlers.removeContact);

router.put('/:contactId', contactsHandlers.updateContact);

module.exports = router;
