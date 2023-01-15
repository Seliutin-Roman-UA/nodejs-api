const mongoose = require('mongoose');
const Joi = require('joi');
var gravatar = require('gravatar');
const fs = require('fs/promises');
const path = require('path')



const { hashPassword, comparePasswords } = require('../Helpers/password.js');
const {userSchema} = require('./schema.js');
const { generateToken, verifyToken } = require('../Helpers/token.js');
const User = mongoose.model('User', userSchema);


function makeValidate(req, res) {
    const schema = Joi.object({
        password: Joi.string()
            .pattern(/^[ а-яА-Яa-zA-Z0-9]+$/)
            .min(6),
        email: Joi.string()
            .email({ minDomainSegments: 2 }),
        subscription: Joi.string().valid("starter", "pro", "business")
    });  
    const validate = schema.validate({password, email, subscription = "starter"}=req.body, );
    if (validate.error) {
        res.status(400).send(JSON.stringify({"message": `validate failed with error ${validate.error}`}));
        return false;
    };
    return true;
}

async function userRegistration(req, res) {
    if (!makeValidate(req, res)) return;
    const password = await hashPassword(req.body.password);
    var url = gravatar.url(email);
    console.log("gravatar.url = ", url);
    const newUser = new User({});
    newUser.password = password;
    newUser.email = req.body.email; 
    newUser.avatarURL = url;
    newUser.save(async (err, data) => {    
        if (err) {
            switch (err.code) {
                case 11000:
                    res.status(400).json({ "message": "Email in use", "err": err });
                    break;
            
                default:
                    res.status(400).json({ "message": "Error occurred", "err": err });
                    break;
            }
        } else {
            const token = await generateToken({ id: data._id });
            res.json({ message: "Hello, new freind!!!", "data": {"id":data._id, "email": data.email}, "token": token });
            }         
        });
}

async function userLogin(req, res) {
    const { email, password } = req.body;

    User.findOne({ email }, async function (err, data) {
        if (err) {
            res.status(500).json({ "message": "Somthing is wrong", "err": err });
            return;
        }
        if (!data) {
            res.status(400).json({ "message": "Email or password is wrong" });
            return;
        }        
        const passwordIsRight = await comparePasswords(password, data.password);           
        if (passwordIsRight) {
            const token = await generateToken({ id: data._id });
            res.json({ "message": "Authorization is successful", "token": token });
        } else {
            res.status(400).json({ "message": "Email or password is wrong"});
        }
                     
    });
}

async function getInfoCurrentUser(req, res) {
    const id = req.user.id;     
    await User.findById(id, '_id email subscription')
        .exec((err, user) => {
            if (err) res.status(500).json({"message": err});;
            if (user === null) {
                res.status(400).json({"message": `user not found with id: ${id}`});
                return;
            }    
            res.json({ "data": user });
        })
    
    
}

async function updateSubscription(req, res) {
    if (!makeValidate(req, res)) return;
    const id = req.user.id;  
    const { subscription } = req.body;
    if (subscription) {
        await User.findByIdAndUpdate(id, { $set: { subscription } })
            .exec((err, user) => {
                if (err) res.status(500).json({"message": err});
                if (user === null) {
                    res.status(400).json({"message": `user not found with id: ${id}`});
                    return;
                }    
                res.json({ "message": "Subscription updated" });
        })
       
    }
}

async function updateAvatar(req, res) {
    
    try {
        const id = req.user.id; 
        await User.findById(id)
            .exec(async(err, user) => {                
                if (err) res.status(500).json({ "message": err });
                if (user === null) res.status(400).json({ "message": `user not found with id: ${id}`});
                try {
                    await fs.access(user.avatarURL, fs.constants.F_OK); 
                    await fs.unlink(user.avatarURL);                     
                } catch (err) {
                    console.log("наверное нет такого файла или что то не так");                  
                } 
                user.avatarURL = req.file.newpath;
                user.save();
            });
       
        await fs.cp(req.file.path, req.file.newpath);  
        res.json({ "message": "success" });
    } catch (err) {
        res.status(400).json({ "message": "File did not save" });
    } finally {
        await fs.unlink(req.file.path);         
    }    
}

module.exports = {
    userRegistration,
    userLogin,
    getInfoCurrentUser,
    updateSubscription,
    updateAvatar
}