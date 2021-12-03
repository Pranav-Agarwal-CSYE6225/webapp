'user strict';

const mysql = require('mysql');
const config = require('../config.json');
const log = require("../logs")
const logger = log.getLogger('logs');

// Create db
let dbConn_replica = mysql.createConnection({
  host     : (config.hostRdsReadReplica).split(":")[0],
  user     : config.username,
  password : config.password,
  database : config.database,
  port : config.port,
  insecureAuth: true
});
dbConn_replica.connect(function(err) {
    if (err) throw err;
    console.log("Database Replica Connected!");
    logger.info("Database Replica Connected.");
});
module.exports = dbConn_replica;
