const { verifyToken } = require('../Helpers/token.js');

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
    
    req.user = dataUser;
    console.log("id from token", req.user);
    next();
}
module.exports = {
    checkUser
}