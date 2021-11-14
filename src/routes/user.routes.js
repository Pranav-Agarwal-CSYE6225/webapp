const express = require('express')
const router = express.Router()
const userController =   require('../controllers/user.controller');
const imageController =   require('../controllers/image.controller');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const log = require("../../logs")
const logger = log.getLogger('logs');

// Middleware to authenticate user
async function authorizeUser(req,res,next){
    const token = req.headers.authorization.split(" ")[1]
    const [username,password] = Buffer.from(token,'base64').toString('ascii').split(':');
    try{
      const user = await User.findUser(username);
      if(user[0]==null){
        logger.info("User not found, authorization failed.");
        res.status(400).send({ error:true, message: 'User not found' });
        return;
      }
      else if(!(await bcrypt.compare(password, user[0].password))){
        logger.info("Wrong password, authorization failed.");
        res.status(400).send({ error:true, message: 'Wrong Password' });
        return;
      }
      else{
        req.params.userId = user[0].id;
        logger.info("Request Authorized.");
        next();
      }
    }
    catch(err){
      console.log(err);
      logger.info("bad request.");
      res.status(400).send({ error:true, message: 'bad request' });
    }
}

// Create a new user
router.post('/', userController.create);

// Retrieve a user
router.get('/self', authorizeUser, userController.getUser);

// Update a user
router.put('/self', authorizeUser, userController.update);

// Create/Update an image
router.post('/self/pic', authorizeUser,imageController.create);

// get an image
router.get('/self/pic', authorizeUser, imageController.getImage);

// delete an image
router.delete('/self/pic', authorizeUser, imageController.delete);

module.exports = router