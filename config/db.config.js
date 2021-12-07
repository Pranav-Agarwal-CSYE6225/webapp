'user strict';

const mysql = require('mysql');
const config = require('../config.json');
const log = require("../logs")
const logger = log.getLogger('logs');
var fs = require('fs');

// Create db
let con = mysql.createConnection({
  host     : (config.host).split(":")[0],
  ssl                 : {
    ca                : fs.readFileSync(__dirname + '/certs/rds-ca-2019-root.pem')
  },
  user     : config.username,
  password : config.password,
  port : config.port,
  insecureAuth: true
});
let dbConn = mysql.createConnection({
  host     : (config.host).split(":")[0],
    ssl                 : {
    ca                : fs.readFileSync(__dirname + '/certs/rds-ca-2019-root.pem')
  },
  user     : config.username,
  password : config.password,
  database : config.database,
  port : config.port,
  insecureAuth: true
});
con.connect(function(err) {
  if (err) throw err;
  con.query("CREATE DATABASE IF NOT EXISTS "+config.database, function (err, result) {
    if (err) throw err;
    console.log("Database created");
    dbConn.connect(function(err) {
      if (err) throw err;
    
      const createUser = `CREATE TABLE IF NOT EXISTS user (
        id int NOT NULL AUTO_INCREMENT,
        first_name varchar(100) NOT NULL,
        last_name varchar(100) NOT NULL,
        username varchar(100) NOT NULL,
        password varchar(100) NOT NULL,
        account_created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        account_updated datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        verified boolean not null default 0,
        verified_on datetime,
        PRIMARY KEY (id,username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;`
    
      const createImage = `CREATE TABLE IF NOT EXISTS image (
        id int NOT NULL AUTO_INCREMENT,
        file_name varchar(100) NOT NULL,
        url varchar(100) NOT NULL,
        upload_date date NOT NULL,
        user_id int NOT NULL,
        PRIMARY KEY (id,file_name),
        FOREIGN KEY (user_id) REFERENCES user(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;`
    
      dbConn.query(createUser, function (err, result) {
        if (err) throw err;
      });
    
      dbConn.query(createImage, function (err, result) {
        if (err) throw err;
      });
    
      console.log("Database Connected!");
      logger.info("Database Connected.");
    });
  });
});
module.exports = dbConn;
