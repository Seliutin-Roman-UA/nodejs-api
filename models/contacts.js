const fs = require('fs/promises');
const paht = require('path');
const Joi = require('joi');

const PAHT = paht.resolve(__dirname, 'contacts.json');
const schema = Joi.object({
  name: Joi.string()
      .alphanum()
      .min(3),     
  phone: Joi.string()
      .pattern(/^[\+0-9-()]+$/),
  email: Joi.string()
      .email({ minDomainSegments: 2})
})

function makeValidate(req, res){
  const validate = schema.validate(req.body);
  if (validate.error) {
    res.status(400).send(JSON.stringify({"message": validate.error}));
    return false;
  };
  return true;
}

async function getDataFromFile() {
  try {   
      const data = await fs.readFile(PAHT, 'utf8');
      const contacts = JSON.parse(data);
      return contacts;
  } catch (err) {
    console.log('\x1b[1;31;44mне могу прочитать файл контактов\x1b[0m', err);
  }
}
async function writeDataInFile(data) {
  try {  
      const contacts = JSON.stringify(data); 
      await fs.writeFile(PAHT, contacts);        
  } catch (err) {
    console.log('\x1b[1;31;44mне смог записать контакты\x1b[0m', err);
  }
}

const listContacts = async (req, res) => {
  try {        
    const contacts = await getDataFromFile();
    res.status(200).send(contacts);
   
  } catch (err) {
    console.log('\x1b[1;31;44mпроблемки....\x1b[0m', err)
  }
}

const getContactById = async (req, res) => {
  try { 
    const id = req.params.contactId;   
    console.log("params ====", id);
    const contacts = await getDataFromFile();
    const result = contacts.find(el => el.id === id);
    if (result !== undefined) {
      res.status(200).send(JSON.stringify(result));
    } else {
      res.status(404).send(JSON.stringify({"message": "Not found"}));
    }
  } catch (err) {
    console.log('\x1b[1;31;44mпроблемки....\x1b[0m', err);
  }
}

const addContact = async (req, res) => {
  try {     
    let {name, email, phone} = req.body;
    if (!makeValidate(req, res)) return;
    if (!(name && email && phone)) {
      res.status(400).send(JSON.stringify({"message": "missing required name field"}));
      return;
    }
    const contacts = await getDataFromFile();
    const contactExist = contacts.find(el => el.phone === phone);
    if (contactExist !== undefined ){
      res.status(405).send(JSON.stringify({"message": `contact with ${phone} already exist`}));
      return;
    }
    const ids = contacts.map(el => el.id).sort((a, b) => a - b).reverse()
    const id = String(+ids[0] + 1);
    contacts.push({id, name, email, phone});
    res.status(201).send(JSON.stringify({id, name, email, phone}))
    writeDataInFile(contacts);    
    
  } catch (err) {
      console.log('\x1b[1;31;44mпроблемки....\x1b[0m', err);
  }
}

const removeContact = async (req, res) => {
  try {  
    const id = req.params.contactId;  
    const contacts = await getDataFromFile();
    const index = contacts.findIndex(el => el.id === id);
    if (index!== -1){
        contacts.splice(index, 1);
        res.status(200).send(JSON.stringify({"message": "contact deleted"}));
        writeDataInFile(contacts);
    }else { 
      res.status(404).send(JSON.stringify({"message": "Not found"}));
    }
    
  } catch (err) {
    console.log('\x1b[1;31;44mпроблемки....\x1b[0m', err)
  }
  
}

const updateContact = async (req, res) => {
  try {    
    const {name, email, phone} = req.body;
    if (!makeValidate(req, res)) return;
    const id = req.params.contactId; 
    const contacts = await getDataFromFile();
    const index = contacts.findIndex(el => el.id === id);
    if (index!== -1) {
      if (name) contacts[index].name = name;
      if (email) contacts[index].email = email;
      if (phone) contacts[index].phone = phone;
      writeDataInFile(contacts);
      res.status(200).send(JSON.stringify(contacts[index]));
    } else {
      res.status(404).send(JSON.stringify({"message": "Not found"}));
    }
  } catch (err) {
    console.log('\x1b[1;31;44mпроблемки....\x1b[0m', err);
  }
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
