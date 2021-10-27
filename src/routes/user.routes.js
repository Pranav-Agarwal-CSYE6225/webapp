const express = require('express')
const router = express.Router()
const userController =   require('../controllers/user.controller');
const imageController =   require('../controllers/image.controller');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const multer = require('multer');
const config = require('../../config.json');
let fs = require('fs-extra');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const path = require('path')

aws.config.update({
    secretAccessKey: 'QWuLK4QVrpl89maGXCMIVuVYYShIUHLsnfTMa1rr',
    accessKeyId: 'AKIA3O4SWH5KHVN4IX57',
    region: 'us-east-1'
});

s3 = new aws.S3();

async function authorizeUser(req,res,next){
    const token = req.headers.authorization.split(" ")[1]
    const [username,password] = Buffer.from(token,'base64').toString('ascii').split(':');
    try{
      const user = await User.findUser(username);
      if(user[0]==null){
        res.status(400).send({ error:true, message: 'User not found' });
        return;
      }
      else if(!(await bcrypt.compare(password, user[0].password))){
        res.status(400).send({ error:true, message: 'Wrong Password' });
        return;
      }
      else{
        req.params.userId = user[0].id;
        next();
      }
    }
    catch(err){
      console.log(err);
      res.status(400).send({ error:true, message: 'bad request' });
    }
}

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: config.s3,
        key: async function (req, file, cb) {
            const filePath = config.s3+"/"+req.params.userId+"/"+ Date.now() + path.extname(file.originalname);
            req.params.filePath = filePath;
            req.params.fileName = file.originalname;
            const ext = path.extname(file.originalname).toLowerCase();
            if(!(ext==".png" || ext==".jpg" || ext==".jpeg")){
                req.fileValidationError = "Forbidden extension";
                return cb(null,"err");
            }
            cb(null, filePath);
        }
    })
});

function validateFile(req,res,next){
    if (req.fileValidationError) {
        return res.status(400).send({ error:true, message: 'Incorrect File Type' });
    }
   else{
       next();
   }
}

// Create a new user
router.post('/', userController.create);

// Retrieve a user
router.get('/self', authorizeUser, userController.getUser);

// Update a user
router.put('/self', authorizeUser, userController.update);

// Create/Update an image
router.post('/self/pic', authorizeUser, upload.single('img'), validateFile, imageController.create);

// get an image
router.get('/self/pic', authorizeUser, imageController.getImage);

// delete an image
router.delete('/self/pic', authorizeUser, imageController.delete);

module.exports = router