'use strict';
const User = require('../models/user.model');
const validator = require("email-validator");
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.create = function(req, res) {
  let {first_name,last_name,username,password} = req.body;
  if(first_name==null || last_name==null || username==null || password==null){
    res.status(400).send({ error:true, message: 'Missing required fields' });
  }
  else if(!validator.validate(username)){
    res.status(400).send({ error:true, message: 'Invalid email' });
  }
  else{
    User.findUser(username, function(err, user) {
      if (err) res.status(400).send({ error:true, message: 'Bad request' });
      else if (user[0]!=null) res.status(400).send({ error:true, message: 'username already exists' });
      else{
        bcrypt.hash(password, saltRounds, function(err, hash) {
          if (err) res.status(400).send({ error:true, message: 'Bad request' });
          User.create(first_name,last_name,username,hash, function(err, user) {
            if (err) res.status(400).send({ error:true, message: 'Bad request' });
            User.findUser(username, function(err, user) {
                if (err) res.status(400).send({ error:true, message: 'Bad request' });
                delete user[0].password;
                res.status(201).json(user[0]);
            });
          });
        });
      }
    });
  }
};

exports.getUser = function(req, res) {
  const token = req.headers.authorization.split(" ")[1]
  const [username,password] = Buffer.from(token,'base64').toString('ascii').split(':');
  User.findUser(username, function(err, user) {
    if (err) res.status(400).send({ error:true, message: 'Bad request' });
    else if (user[0]==null) res.status(400).send({ error:true, message: 'User not found' });
    else {
      bcrypt.compare(password, user[0].password, function(err, result) {
        if (err) res.status(400).send({ error:true, message: 'Bad request' });
        if(!result) res.status(403).send({ error:true, message: 'Wrong Password' });
        else{
          delete user[0].password;
          res.status(200).json(user[0]);
        } 
      });
    }
  });
};

exports.update = function(req, res) {
  const token = req.headers.authorization.split(" ")[1]
  const [username,password] = Buffer.from(token,'base64').toString('ascii').split(':');
  User.findUser(username,function(err, userToUpdate) {
    if (err) res.status(400).send({ error:true, message: 'Bad request' });
    else if (userToUpdate[0]==null) res.status(400).send({ error:true, message: 'User not found' });
    else {
      bcrypt.compare(password, userToUpdate[0].password, function(err, result) {
        if (err) res.status(400).send({ error:true, message: 'Bad request' });
        if(!result) res.status(403).send({ error:true, message: 'Wrong Password' });  
        else{
          let {first_name,last_name,username,password,account_created,account_updated} = req.body;
          if(first_name==null) first_name = userToUpdate[0].first_name;
          if(last_name==null) last_name = userToUpdate[0].last_name;
          if(password==null) password = userToUpdate[0].password;
          if(username!=null || account_created!=null || account_updated!=null) res.status(400).send({ error:true, message: 'Bad request' });
          else{
            bcrypt.hash(password, saltRounds, function(err, hash) {
              if (err) res.status(400).send({ error:true, message: 'Bad request' });
              User.update(first_name,last_name,userToUpdate[0].username,hash, function(err, user) {
                if (err) res.status(400).send({ error:true, message: 'Bad request' });
                res.status(204).send({ error:false, message: 'User successfully updated' });
              });
            });
          }
        }
      });
    }
  });
};