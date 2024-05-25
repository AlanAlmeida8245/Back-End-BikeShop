const jwt = require('jsonwebtoken');

function verifyJWT(req, res, next){
    const token = req.headers['authorization']
    if(!token) return res.status(401).json({auth: false, message:  "No Token provided"})

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if(err)  return res.status(500).json({auth: false, message: "falha ao authenticar token !"})

        req.userID = decoded.id
        next();
    })
}
module.exports = verifyJWT
