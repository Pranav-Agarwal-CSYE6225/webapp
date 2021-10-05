'use strict';
const User = require('../models/user.model');

exports.create = function(req, res) {
  let {first_name,last_name,username,password} = req.body;
  if(first_name==null || last_name==null || username==null || password==null){
    res.status(400).send({ error:true, message: 'Missing required fields' });
  }
  else{
    User.findUser(username, function(err, user) {
      if (err) res.status(400).send({ error:true, message: 'Bad request' });
      else if (user[0]!=null) res.status(400).send({ error:true, message: 'username already exists' });
      else{
        User.create(first_name,last_name,username,password, function(err, user) {
          if (err) res.status(400).send({ error:true, message: 'Bad request' });
          User.findUser(username, function(err, user) {
              if (err) res.status(400).send({ error:true, message: 'Bad request' });
              delete user[0].password;
              res.status(201).json(user[0]);
          });
        });
      }
    });
  }
};

exports.getUser = function(req, res) {
  const token = req.headers.authorization.split(" ")[1]
  console.log(token+"here")
  const [username,password] = Buffer.from(token,'base64').toString('ascii').split(':');
  console.log(username+" "+password);
  User.findUser(username, function(err, user) {
    if (err) res.status(400).send({ error:true, message: 'Bad request' });
    else if (user[0]==null) res.status(400).send({ error:true, message: 'User not found' });
    else if(user[0].password!=password) res.status(403).send({ error:true, message: 'Wrong Password' });
    else{
      delete user[0].password;
      res.status(200).json(user[0]);
    } 
  });
};

exports.update = function(req, res) {
  const token = req.headers.authorization.split(" ")[1]
  console.log(token+"here")
  const [username,password] = Buffer.from(token,'base64').toString('ascii').split(':');
  console.log(username+" "+password);
  User.findUser(username,function(err, userToUpdate) {
    if (err) res.status(400).send({ error:true, message: 'Bad request' });
    else if (userToUpdate[0]==null) res.status(400).send({ error:true, message: 'User not found' });
    else if(userToUpdate[0].password!=password) res.status(403).send({ error:true, message: 'Wrong Password' });      
    else{
      console.log(req.body);
      let {first_name,last_name,username,password} = req.body;
      if(first_name==null) first_name = userToUpdate[0].first_name;
      if(last_name==null) last_name = userToUpdate[0].last_name;
      if(password==null) password = userToUpdate[0].password;
      console.log(first_name+" "+last_name+" "+userToUpdate[0].username+" "+password)
      User.update(first_name,last_name,userToUpdate[0].username,password, function(err, user) {
        if (err) res.status(400).send({ error:true, message: 'Bad request' });
        res.status(204).send({ error:false, message: 'User successfully updated' });
      });
    }
  });
};