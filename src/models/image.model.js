'use strict';
var dbConn = require('../../config/db.config');
//Image object create
var Image = function(filename,url,user_id){
    this.filename = filename;
    this.url = url;
    this.user_id = user_id;
};

Image.create = function (filename,url,user_id) {
  return new Promise((resolve,reject) => {
    var date = new Date();
    const upload_date =  new Date(date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate());
    dbConn.query("INSERT INTO image (file_name, url, user_id, upload_date) VALUES (?,?,?,?)",[filename,url,user_id,upload_date], function (err, res) {
      if(err) {
        reject(err);
      }
      else{
        resolve(res);
      }
    });
  });
};

Image.delete = function (user_id) {
  return new Promise((resolve,reject) => {
    dbConn.query("DELETE FROM image WHERE user_id = ? ", [user_id], function (err, res) {
    if(err) {
      reject(err);
    }
    else{
      resolve(res);
    }
    });
  });
};

Image.findImage = function(user_id){
  return new Promise((resolve,reject) => {
    dbConn.query("Select file_name,id,url,upload_date,user_id from image where user_id = ? ", user_id, function (err, res) {
      if(err) {
        reject(err);
      }else{
        resolve(res);
      }
    });
  });
}

module.exports= Image;