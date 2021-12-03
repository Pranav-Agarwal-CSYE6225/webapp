'use strict';
const User = require('../models/user.model');
const validator = require("email-validator");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const log = require("../../logs")
const logger = log.getLogger('logs');
var SDC = require('statsd-client');
var Metrics = new SDC({port: 8125});
const config = require('../../config.json');
const aws = require('aws-sdk');
const awsConf = {
  region: "us-east-1"
}
aws.config.update(awsConf);
const docClient = new aws.DynamoDB.DocumentClient({ profile: 'prod', region: "us-east-1" });
const snsClient = new aws.SNS({ apiVersion: "2010-03-31" })

exports.create = async function(req, res) {
  let timer = new Date();
  Metrics.increment('user.POST.createUser.count');
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
      var token = await bcrypt.hash(username, saltRounds);
      let ttl = 60 * 5
      const current = Math.floor(Date.now() / 1000)
      const expiresIn = ttl + current
      var tableName = "csye6225-dynamo"
      const params = {
          TableName: tableName,
          Item: {
              UserName : username,
              token : token,
              ttl:  expiresIn
          }
      }
      await docClient.put(params).promise();
      const paramSNS = {
          "message-type":"email",
          "email":username, 
          "token":token
      }
      const data = {
          Subject: "Email",
          Message: JSON.stringify(paramSNS),
          TopicArn: config.topic_arn
      }
      logger.info("publishing to SNS ");
      await snsClient.publish(data).promise();
      logger.info("SNS published ");
      const newUser = await User.findUser(username);
      delete newUser[0].password;
      logger.info("created new user with ID "+newUser[0].id);
      Metrics.timing('user.POST.createUser.timer', timer);
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
  let timer = new Date();
  Metrics.increment('user.GET.getUser.count');
  const token = req.headers.authorization.split(" ")[1]
  const [username,password] = Buffer.from(token,'base64').toString('ascii').split(':');
  try{
    const user = await User.findUser(username);
    delete user[0].password;
    logger.info("retrieved user with ID "+user[0].id);
    Metrics.timing('user.GET.getUser.timer', timer);
    res.status(200).json(user[0]);
    return;
  }
  catch(err){
    console.log(err);
    res.status(400).send({ error:true, message: 'bad request' });
  }
};

exports.update = async function(req, res) {
  let timer = new Date();
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
    Metrics.timing('user.PUT.updateUser.timer', timer);
    res.status(204).send({ error:false, message: 'User successfully updated' });
    return;
  }
  catch(err){
    console.log(err);
    res.status(400).send({ error:true, message: 'bad request' });
  }
};

exports.verify = async function(req,res){
  logger.info("verifying email");
  const {email, token} = req.query;
  logger.info("verifying email "+email+" with token "+token);
  const tablename = "csye6225-dynamo"
  const params = {
      TableName: tablename,
      Key:{
          UserName : email,
          token : token 
      }
  }

  console.log(email)
  docClient.get(params,(err,data)=>{
      if(err){
          console.error(err);
      }else{
          let isTokenValid = false;
          console.log("Checking if record already present in DB!!");
          if (data.Item == null || data.Item == undefined) {
              logger.info("No record in Dynamo ");
              isTokenValid = false;
          } else {
              if(data.Item.ttl < Math.floor(Date.now() / 1000)) {
                  logger.info("ttl expired ");
                  isTokenValid = false;
              } else {
                  logger.info("TTL record valid ");
                  isTokenValid = true;
              }
          }
          if(isTokenValid) {
              User.verifyUser(email).then(()=>{
                  res.send(200)
              }).catch((e)=>{
                  res.send(400)
              })
          }else{
              res.send(400)
          }

      }
  })
};