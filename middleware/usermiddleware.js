const { date } = require('joi');
const mongoose = require('mongoose');
const { verifyToken } = require('../Helpers/token.js');
const { userSchema } = require('../Auth/schema');

const User = mongoose.model('User', userSchema);

async function checkUser(req, res, next) {
    let dataUser;
    try {
        const [_, token] = req.headers.authorization.split(" ");
        if (!token) throw new Error;
        dataUser = await verifyToken(token)
    } catch {
        res.status(401).json({ "message": "Bad token" });
        return;
    }   
    await User.findById(dataUser.id)
        .exec((err, date) => {
            if (err) return;
            if (!date.verify) {
                res.status(401).json({ "message": "Email is not verified" });
                throw new Error;
            }
        })
    req.user = dataUser;
    next();
}
module.exports = {
    checkUser
}