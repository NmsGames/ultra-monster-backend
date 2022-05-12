var mysql = require("mysql");

var con = mysql.createConnection({
    host: 'localhost',
    user: "root",
    password: "",
    database: "ulmonster"
});

module.exports = con;