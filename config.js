var mysql = require('mysql2');

exports.con = mysql.createConnection({
  host: "18.191.54.215",
  port:"3306",
  user: "hrasp",
  password:"1234",
  database:"hrasp"
});