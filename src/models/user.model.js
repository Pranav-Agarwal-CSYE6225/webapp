'use strict';
var dbConn = require('../../config/db.config');
//User object create
var User = function(first_name,last_name,username,password){
    this.first_name = first_name;
    this.last_name = last_name;
    this.username = username;
    this.password = password;
};

User.create = function (first_name,last_name,username,password) {
  return new Promise((resolve,reject) => {
    dbConn.query("INSERT INTO user (first_name, last_name, username, password) VALUES (?,?,?,?)",[first_name,last_name,username,password], function (err, res) {
      if(err) {
        console.log("error: ", err);
        reject(err);
      }
      else{
        resolve(res);
      }
    });
  });
};

User.findUser = function (username) {
  return new Promise((resolve,reject) => {
    dbConn.query("Select id,first_name,last_name,username,password,account_created,account_updated from user where username = ? ", username, function (err, res) {
    if(err) {
      console.log("error: ", err);
      reject(err);
    }
    else{
      resolve(res);
    }
    });
  });
};

User.update = function(first_name,last_name,username,password, result){
  return new Promise((resolve,reject) => {
    dbConn.query("UPDATE user SET first_name=?,last_name=?,password=? WHERE username = ?", [first_name,last_name,password,username], function (err, res) {
      if(err) {
        console.log("error: ", err);
        reject(err);
      }else{
        resolve(res);
      }
    });
  });
}

module.exports= User;