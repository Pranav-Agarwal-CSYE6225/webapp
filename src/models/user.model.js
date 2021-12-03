'use strict';
var dbConn = require('../../config/db.config');
var SDC = require('statsd-client');
var Metrics = new SDC({port: 8125});
//User object create
var User = function(first_name,last_name,username,password){
    this.first_name = first_name;
    this.last_name = last_name;
    this.username = username;
    this.password = password;
};

User.create = function (first_name,last_name,username,password) {
  let timer = new Date();
  return new Promise((resolve,reject) => {
    dbConn.query("INSERT INTO user (first_name, last_name, username, password) VALUES (?,?,?,?)",[first_name,last_name,username,password], function (err, res) {
      if(err) {
        console.log("error: ", err);
        reject(err);
      }
      else{
        Metrics.timing('UserDB.insert.timer', timer);
        resolve(res);
      }
    });
  });
};

User.findUser = function (username) {
  let timer = new Date();
  return new Promise((resolve,reject) => {
    dbConn.query("Select id,first_name,last_name,username,password,account_created,account_updated from user where username = ? ", username, function (err, res) {
    if(err) {
      console.log("error: ", err);
      reject(err);
    }
    else{
      Metrics.timing('userDB.select.timer', timer);
      resolve(res);
    }
    });
  });
};

User.update = function(first_name,last_name,username,password, result){
  let timer = new Date();
  return new Promise((resolve,reject) => {
    dbConn.query("UPDATE user SET first_name=?,last_name=?,password=? WHERE username = ?", [first_name,last_name,password,username], function (err, res) {
      if(err) {
        console.log("error: ", err);
        reject(err);
      }else{
        Metrics.timing('userDB.update.timer', timer);
        resolve(res);
      }
    });
  });
}

User.verifyUser = function(username, result){
  let timer = new Date();
  return new Promise((resolve,reject) => {
    dbConn.query("UPDATE user SET verified=?,verified_on=? WHERE username = ?", [true,timer,username], function (err, res) {
      if(err) {
        console.log("error: ", err);
        reject(err);
      }else{
        Metrics.timing('userDB.verify.timer', timer);
        resolve(res);
      }
    });
  });
}

module.exports= User;