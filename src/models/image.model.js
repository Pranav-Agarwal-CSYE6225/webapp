'use strict';
var dbConn = require('../../config/db.config');
var dbConn_replica = require('../../config/db_replica.config');
var SDC = require('statsd-client');
var Metrics = new SDC({port: 8125});
//Image object create
var Image = function(filename,url,user_id){
    this.filename = filename;
    this.url = url;
    this.user_id = user_id;
};

Image.create = function (filename,url,user_id) {
  let timer = new Date();
  return new Promise((resolve,reject) => {
    var date = new Date();
    const upload_date =  new Date(date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate());
    dbConn.query("INSERT INTO image (file_name, url, user_id, upload_date) VALUES (?,?,?,?)",[filename,url,user_id,upload_date], function (err, res) {
      if(err) {
        reject(err);
      }
      else{
        Metrics.timing('ImageDB.insert.timer', timer);
        resolve(res);
      }
    });
  });
};

Image.delete = function (user_id) {
  let timer = new Date();
  return new Promise((resolve,reject) => {
    dbConn.query("DELETE FROM image WHERE user_id = ? ", [user_id], function (err, res) {
    if(err) {
      reject(err);
    }
    else{
      Metrics.timing('ImageDB.delete.timer', timer);
      resolve(res);
    }
    });
  });
};

Image.findImage = function(user_id){
  let timer = new Date();
  return new Promise((resolve,reject) => {
    dbConn_replica.query("Select file_name,id,url,upload_date,user_id from image where user_id = ? ", user_id, function (err, res) {
      if(err) {
        reject(err);
      }else{
        Metrics.timing('ImageDB.select.timer', timer);
        resolve(res);
      }
    });
  });
}

module.exports= Image;