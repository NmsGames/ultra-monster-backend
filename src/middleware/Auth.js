const conn = require('../db/config')
const jwt = require('jsonwebtoken')

//Check Authorized
const Auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET) 
      

        let sql  = `SELECT * FROM users WHERE id= ? limit ?`; 
        let user  = await conn.query(sql,[decoded.id,1]); 
        const usersRows = (JSON.parse(JSON.stringify(user))[0]); 
     
        if (!usersRows) {
            throw new Error()
        } 
        req.token   = token
        req.user    = usersRows
        req.ID    = decoded.id
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}
module.exports = Auth