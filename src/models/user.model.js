'use strict';
var dbConn = require('../../config/db.config');
//Employee object create
var User = function(user){
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.username = user.username;
    this.password = user.password;
};

User.create = function (newUser, result) {
dbConn.query("INSERT INTO user set ?", newUser, function (err, res) {
if(err) {
  console.log("error: ", err);
  result(err, null);
}
else{
  console.log(res.insertId);
  result(null, res.insertId);
}
});
};

User.findById = function (id, result) {
dbConn.query("Select id,first_name,last_name,username,created_timestamp,updated_timestamp from user where id = ? ", id, function (err, res) {
if(err) {
  console.log("error: ", err);
  result(err, null);
}
else{
  result(null, res);
}
});
};

User.update = function(id, user, result){
dbConn.query("UPDATE user SET first_name=?,last_name=?,username=?,password=? WHERE id = ?", [user.first_name,user.last_name,user.username,user.password,id], function (err, res) {
if(err) {
  console.log("error: ", err);
  result(null, err);
}else{
  result(null, res);
}
});
};

module.exports= User;