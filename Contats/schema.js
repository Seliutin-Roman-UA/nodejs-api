const mongoose = require('mongoose');

const contactsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Set name for contact'],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
    unicue: true,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: String,
  }
});


module.exports = {
  contactsSchema
  
}


