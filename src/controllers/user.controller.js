'use strict';
const User = require('../models/user.model');
const validator = require("email-validator");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const log = require("../../logs")
const logger = log.getLogger('logs');
var SDC = require('statsd-client');
var Metrics = new SDC({port: 8125});

exports.create = async function(req, res) {
  Metrics.increment('user.POST.createUser');
  const {first_name,last_name,username,password} = req.body;
  if(first_name==null || last_name==null || username==null || password==null){
    res.status(400).send({ error:true, message: 'Missing required fields' });
  }
  else if(!validator.validate(username)){
    res.status(400).send({ error:true, message: 'Invalid email' });
  }
  else{
    try{
      const oldUser = await User.findUser(username);
      if(oldUser[0]!=null){
        res.status(400).send({ error:true, message: 'username already exists' });
        return;
      }
      const hash = await bcrypt.hash(password, saltRounds);
      await User.create(first_name,last_name,username,hash);
      const newUser = await User.findUser(username);
      delete newUser[0].password;
      logger.info("created new user with ID "+newUser[0].id);
      res.status(201).json(newUser[0]);
      return;
    }
    catch(err){
      console.log(err);
      res.status(400).send({ error:true, message: 'bad request' });
    }
  }
};

exports.getUser = async function(req, res) {
  Metrics.increment('user.GET.getUser');
  const token = req.headers.authorization.split(" ")[1]
  const [username,password] = Buffer.from(token,'base64').toString('ascii').split(':');
  try{
    const user = await User.findUser(username);
    delete user[0].password;
    logger.info("retrieved user with ID "+user[0].id);
    res.status(200).json(user[0]);
    return;
  }
  catch(err){
    console.log(err);
    res.status(400).send({ error:true, message: 'bad request' });
  }
};

exports.update = async function(req, res) {
  Metrics.increment('user.PUT.updateUser');
  const token = req.headers.authorization.split(" ")[1]
  const [user,password] = Buffer.from(token,'base64').toString('ascii').split(':');
  try{
    const userToUpdate = await User.findUser(user);
    let {first_name,last_name,username,password,account_created,account_updated} = req.body;
    if(first_name==null) first_name = userToUpdate[0].first_name;
    if(last_name==null) last_name = userToUpdate[0].last_name;
    if(password==null) password = userToUpdate[0].password;
    if(username!=null || account_created!=null || account_updated!=null){
      res.status(400).send({ error:true, message: 'Bad request' });
      return;
    } 
    const hash = await bcrypt.hash(password, saltRounds);
    await User.update(first_name,last_name,userToUpdate[0].username,hash);
    logger.info("updated user");
    res.status(204).send({ error:false, message: 'User successfully updated' });
    return;
  }
  catch(err){
    console.log(err);
    res.status(400).send({ error:true, message: 'bad request' });
  }
};