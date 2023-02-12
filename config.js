var mysql = require('mysql2');

exports.con = mysql.createConnection({
  host: "localhost",
  user: "hasp",
  password:"1234",
  database:"hrasp"
});