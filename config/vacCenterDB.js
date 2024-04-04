const mysql = require("mysql2");

var connection = mysql.createPool({
  host: "localhost",
  user: "ikkey",
  password: "Ikkeyzaza2892",
  database: "vacCenter",
});

module.exports = connection;
