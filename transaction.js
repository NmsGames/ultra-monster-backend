var con = require('./connection')
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const upload = require('express-fileupload')
const profile = require('./src/upload/imageUpload');
const { fields } = require('./src/upload/imageUpload');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    console.log(`URL: ${request.url}`);
    response.send('Hello, Server!');

})

// Transaction history
app.get("/api/transaction", function (req, res) {
    // res.sendFile(__dirname + '/src/view/transaction.html')
    res.writeHead(200, { 'Content-Type': 'text/json' });
    con.query('Select * from transaction_his', (err, result) => {
        if (err) throw err;
        res.write(JSON.stringify(result));
        res.end()
    })
})

app.post('/api/transaction', function (req, res) {
    // console.log(req.body)
    var user_id = req.body.user_id;
    var txn_id = req.body.txn_id;
    var txn_amount = req.body.txn_amount;
    var txn_date = req.body.txn_date;
    var status = req.body.status;

    con.connect(function (error) {
        if (error) throw error;

        var sql = "INSERT INTO transaction_his(user_id, txn_id, txn_amount, txn_date, status)VALUES('" + user_id + "','" + txn_id + "','" + txn_amount + "','" + txn_date + "','" + status + "')";
        con.query(sql, function (error, result) {
            if (error) throw error;
            res.send("transaction history added")
        })
    })
});

// userlist
app.get('/api/userslist', function (req, res) {

    res.writeHead(200, { 'Content-Type': 'text/json' });
    con.query('Select * from users_list', (err, result) => {
        if (err) throw err;

        res.write(JSON.stringify(result));
        res.end()
    })
})
// app.get("/userslist", function (req, res) {
//     res.sendFile(__dirname + '/src/view/userslist.html')
// })

app.post('/api/userslist', function (req, res) {
    // console.log(req.body)
    var username = req.body.username;
    var user_email = req.body.user_email;
    var phone_no = req.body.phone_no;
    var status = req.body.status;

    con.connect(function (error) {
        if (error) throw error;

        var sql = "INSERT INTO users_list(username, user_email, phone_no, status)VALUES('" + username + "','" + user_email + "','" + phone_no + "','" + status + "')";
        con.query(sql, function (error, result) {
            if (error) throw error;
            res.send("transaction history added")
        })
    })
});

// profile 
app.use(upload())

app.get("/api/profile", function (req, res) {
    // res.sendFile(__dirname + '/src/view/transaction.html')
    res.writeHead(200, { 'Content-Type': 'text/json' });
    con.query('Select * from profile', (err, result) => {
        if (err) throw err;
        res.write(JSON.stringify(result));
        res.end()
    })
})

// app.get('/api/profile', (req, res) => {
//     res.sendFile(__dirname + '/src/view/profile.html')
// })

app.post('/api/profile', (req, res) => {
    if (req.files) {
        // console.log(req.files)
        var username = req.body.username;
        var image = req.files.file
        var filename = image.name
        var email = req.body.email;
        var password = req.body.password;
        console.log("file name", filename)

        var prfoileFile = req.files.file
        // let reqPath = path.join(__dirname, '../../public')
        uploadPath = `./src/upload/${prfoileFile.name}`
        // uploadPath = `${reqPath}/${imagUrl}`


        prfoileFile.mv(uploadPath, function (err) {
            if (err) {
                res.send(err)
            } else {
                con.connect(function (error) {
                    if (error) throw error;
                    var sql = "INSERT INTO profile(username, email,image,password )VALUES('" + username + "','" + email + "','" + uploadPath + "','" + password + "')";
                    con.query(sql, function (error, result) {
                        if (error) throw error;
                        res.send("profile added")
                    })
                })
            }
        })
    }
})


// withdraw request
// app.get('/api/withdraw', (req, res) => {
//     res.sendFile(__dirname + '/src/view/withdraw_req.html')

// })

app.get("/api/withdraw", function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/json' });
    con.query('Select * from withdraw_req', (err, result) => {
        if (err) throw err;
        res.write(JSON.stringify(result));
        res.end()
    })
})

app.post('/api/withdraw', function (req, res) {
    // console.log(req.body)
    var user_id = req.body.user_id;
    var refund_amount = req.body.refund_amount;
    var request_status = req.body.request_status;
    var email = req.body.email;
    var type = req.body.type;
    var created_at = req.body.created_at;
    var modified_at = req.body.modified_at;


    con.connect(function (error) {
        if (error) throw error;

        var sql = "INSERT INTO withdraw_req(user_id, refund_amount, request_status, email,type,created_at,modified_at)VALUES('" + user_id + "','" + refund_amount + "','" + request_status + "','" + email + "','" + type + "','" + created_at + "','" + modified_at + "')";
        con.query(sql, function (error, result) {
            if (error) throw error;
            res.send("withdraw request added")
        })
    })
});


// KYC Details
app.use(upload())

// app.get("/api/userkyc", function (req, res) {
//     res.writeHead(200, { 'Content-Type': 'text/json' });
//     con.query('Select * from profile', (err, result) => {
//         if (err) throw err;
//         res.write(JSON.stringify(result));
//         res.end()
//     })
// })

// app.get('/api/userkyc', (req, res) => {
//     res.sendFile(__dirname + '/src/view/kyc_details.html')
// })

app.post('/api/userkyc', (req, res) => {

    // console.log(req, req.body)

    // if (req.files)
    // {
    // console.log(req.files)
    var kyc_id = req.body.kyc_id;
    var user_id = req.body.user_id;
    var card_number = req.body.card_number;
    var card_per_name = req.body.card_per_name;
    var card_dob = req.body.card_dob;
    var image = req.files.file
    var filename = image.name
    var is_status = req.body.is_status;
    var is_type = req.body.is_type;

    console.log("file name", filename)

    var prfoileFile = req.files.file_url
    uploadPath = `./src/upload/kyc/${prfoileFile.name}`

    prfoileFile.mv(uploadPath, function (err) {
        if (err) {
            res.send(err)
        } else {
            con.connect(function (error) {

                if (error) throw error;
                var sql = "INSERT INTO kyc_details(kyc_id, user_id, card_number, card_per_name, card_dob, image, is_status, is_type )VALUES('" + kyc_id + "','" + user_id + "','" + card_number + "','" + card_per_name + "','" + card_dob + "','" + uploadPath + "','" + is_status + "','" + is_type + "')";

                con.query(sql, function (error, result) {
                    if (error) throw error;
                    res.send("userKyc added")
                })
            })
        }
    })

    // var sql = "INSERT INTO kyc_details(kyc_id, user_id, card_number, card_per_name, card_dob, file_url, is_status, is_type )VALUES('" + kyc_id + "','" + user_id + "','" + card_number + "','" + card_per_name + "','" + card_dob + "','" + null + "','" + is_status + "','" + is_type + "')";

    // con.query(sql, function (error, result) {
    //     if (error) throw error;
    //     res.send("userKyc added")
    // })

})


app.listen(3000, () => {
    console.log("listening to port no. localhost:3000")
});