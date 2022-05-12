const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload')
const app = express()
require('dotenv').config()

const port = 5000;
//db import
require('./src/db/config')

app.use(express.static('public'))
app.use(cors())
app.use(bodyParser.json())
app.use(fileupload())
// Import routes
const AuthRoute = require('./src/routes/AuthRoute')
const UserRoute = require('./src/routes/UserRoute')
const TransactionRoute = require("./src/routes/TransactionRoute")

app.use('/api/auth', AuthRoute)
app.use('/api/users', UserRoute)

app.use('/money/', TransactionRoute)



// Default route direction!!
app.get('/', (req, res) => {
    res.send('default routes!')
})
app.post('/api', (req, res) => {
    res.send('default routes!')
})
app.post('/nothing', (req, res) => {
    res.send('another direction')
})




app.listen(port, () => {
    console.log(`server running at http://localhost:${port}`)
});

