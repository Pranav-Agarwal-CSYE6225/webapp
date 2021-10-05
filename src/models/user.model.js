'use strict';
var dbConn = require('../../config/db.config');
//Employee object create
var User = function(first_name,last_name,username,password){
    this.first_name = first_name;
    this.last_name = last_name;
    this.username = username;
    this.password = password;
};

User.create = function (first_name,last_name,username,password, result) {
  dbConn.query("INSERT INTO user (first_name, last_name, username, password) VALUES (?,?,?,?)",[first_name,last_name,username,password], function (err, res) {
  if(err) {
    console.log("error: ", err);
    result(err, null);
  }
  else{
    console.log(res);
    result(null,res);
  }
  });
};

User.findUser = function (username,result) {
  dbConn.query("Select id,first_name,last_name,username,password,account_created,account_updated from user where username = ? ", username, function (err, res) {
  if(err) {
    console.log("error: ", err);
    result(err, null);
  }
  else{
    result(null, res);
  }
  });
};

User.update = function(first_name,last_name,username,password, result){
  dbConn.query("UPDATE user SET first_name=?,last_name=?,password=? WHERE username = ?", [first_name,last_name,password,username], function (err, res) {
    if(err) {
      console.log("error: ", err);
      result(err, null);
    }else{
      console.log(username);
      result(null, res);
    }
  });
}

module.exports= User;