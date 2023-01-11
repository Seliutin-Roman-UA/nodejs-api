const mongoose = require('mongoose');
const fs = require('fs/promises');
const paht = require('path');
const Joi = require('joi');

const {contactsSchema} = require('./schema.js');
const Contact = mongoose.model('Contact', contactsSchema);

const schema = Joi.object({
  name: Joi.string()
      .pattern(/^[ а-яА-Яa-zA-Z0-9]+$/)
      .min(3),     
  phone: Joi.string()
      .pattern(/^[\+0-9-()]+$/),
  email: Joi.string()
      .email({ minDomainSegments: 2}),
  favorite: Joi.boolean()
})

function makeValidate(req, res){
  const validate = schema.validate(req.body);
  if (validate.error) {
    res.status(400).send(JSON.stringify({"message": `validate failed with error ${validate.error}`}));
    return false;
  };
  return true;
}

const listContacts = async (req, res) => {
  const query = req.query;
  const owner = req.user.id;

  if (query.hasOwnProperty('page') && query.hasOwnProperty('limit')) {
    const {
      page = 1,
      limit = 3,
    } = req.query;

    if (page < 1 || limit < 3) {
      res.status(400).json({ "message": "Query params is wrong" });
      return;
    } 
    
    const totalRecords = await Contact.find({ owner }).count();
    const docs = await Contact.find({ owner })
      .select({ owner: 0, __v: 0 })
      .skip((+page - 1) * +limit)
      .limit(+limit);
    res.json({"message": docs, page, limit, totalRecords});

  } else if (query.hasOwnProperty('favorite')) {
    const {
      favorite = true
    } = req.query;    
    const docs = await Contact.find({ owner, favorite });
    res.json({"message": docs});

  } else {
    res.status(400).json({ "message": "Query params is wrong" });
    return;
  }
  
}

const getContactById = async (req, res) => {
  const owner = req.user.id;
  const _id = req.params.contactId;   
  await Contact.find({_id, owner})
    .exec((err, doc) => {
      console.log(_id, err, doc);
      if (err) return;
      if (doc === null) {
        res.status(400).json({"message": `contact not found with id: ${_id}`});
        return;
      }
      res.status(200).json({"message": doc});
    });
   
}  
 

const addContact = async (req, res) => {
    const owner = req.user.id;
    let {name, email, phone, favorite} = req.body;
    if (!makeValidate(req, res)) return;
    if (!(name && email && phone)) {
      res.status(400).send({"message": "missing required name field"});
      return;
    };
    const newContact = new Contact({ name, email, phone, favorite, owner});
    await newContact.save((err, doc)=>{
      if (err) return;
      res.status(201).json({"message": newContact});
    }
    );     
 
}

const removeContact = async (req, res) => {
    const id = req.params.contactId;   
    await Contact.findByIdAndRemove(id)
    .exec((err, doc) => {
      if (err) return;
      if (doc === null) {
        res.status(400).json({"message": `contact not found with id: ${id}`});
        return;
      }    
      res.status(200).json({"message": "contact deleted"})
    }); 

}

const updateContact = async (req, res) => {   
    const {name, email, phone} = req.body;
    if (!makeValidate(req, res)) return;
    const id = req.params.contactId; 
    await Contact.findByIdAndUpdate(id, {$set:{name, email, phone}})
    .exec((err, doc) => {
      if (err) return;
      if (doc === null) {
        res.status(400).json({"message": `contact not found with id: ${id}`});
        return;
      }    
      res.status(200).json({"message": "success"})
    });
}

const updateStatusContact = async (req, res) => {
   
    let {favorite} = req.body;
    console.log ("favorite  updateStatusContact ", favorite);
    if (!makeValidate(req, res)) return;
    if (favorite === undefined) {
      res.status(400).json({"message": "missing field favorite"})
    };
    const id = req.params.contactId; 
    await Contact.findByIdAndUpdate(id, {$set:{favorite}})
    .exec((err, doc) => {
      if (err) return;
      if (doc === null) {
        res.status(404).json({"message": `contact not found with id: ${id}`});
        return;
      }    
      res.status(200).json({"message": "success"})
    });

  }
  const notPatch = () => {
    res.status(404).json({"message": "the page not found"})};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
  notPatch,
}
