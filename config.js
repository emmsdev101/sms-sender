var mysql = require('mysql2');

exports.con = mysql.createConnection({
  host: "localhost",
  user: "hrasp",
  password:"1234",
  database:"hrasp"
});