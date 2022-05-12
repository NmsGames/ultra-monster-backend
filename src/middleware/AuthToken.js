const jwt = require('jsonwebtoken')
const conn = require('../db/config')

const generateAuthToken = async (userID)=>{ 
    console.log('call token')
    const token = jwt.sign({ id: userID }, process.env.JWT_SECRET)
    console.log('token',token)
    let sql = "UPDATE users Set token= ? WHERE id= ?"
     await conn.query(sql,[token,userID]); 
    return token
}

module.exports ={
    generateAuthToken
}