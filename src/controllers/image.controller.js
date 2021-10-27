'use strict';
const Image = require('../models/image.model');
const aws = require('aws-sdk');
var config = require('../../config.json');

aws.config.update({
    secretAccessKey: 'QWuLK4QVrpl89maGXCMIVuVYYShIUHLsnfTMa1rr',
    accessKeyId: 'AKIA3O4SWH5KHVN4IX57',
    region: 'us-east-1'
});

const s3 = new aws.S3();

exports.create = async function(req, res) {
    try{
        if(!req.params.fileName){
            res.status(400).send({ error:true, message: 'no file uploaded' });
            return;
        }
        const image = await Image.findImage(req.params.userId);
        if(image.length!=0){
            const params = {
                Bucket: config.s3,
                Key: image[0].url
            }
            await s3.deleteObject(params).promise();
            await Image.delete(req.params.userId);
        }
        await Image.create(req.params.fileName,req.params.filePath,req.params.userId);
        const newImage = await Image.findImage(req.params.userId);
        res.status(201).json(newImage[0]);
        return;
    }
    catch(err){
        res.status(400).send({ error:true, message: 'bad request' });
    }
};

exports.getImage = async function(req, res) {
  try{
    const image = await Image.findImage(req.params.userId);
    if(image.length==0){
        res.status(404).send({ error:true, message: 'Not Found' });
        return;
    }
    const params = {
        Bucket: config.s3,
        Key: image[0].url
    }
    console.log("Trying to fetch " + image[0].url + " from bucket " + config.s3)
    const data = await s3.getObject(params).promise();
    console.log("Done loading image from S3");
    res.status(200).write(data.Body, 'binary');
    res.end(null, 'binary');
    return;
  }
  catch(err){
    console.log(err);
    res.status(400).send({ error:true, message: 'bad request' });
  }
};

exports.delete = async function(req, res) {
    try{
        const image = await Image.findImage(req.params.userId);
        if(image.length==0){
            res.status(404).send({ error:true, message: 'Not Found' });
            return;
        }
        const params = {
            Bucket: config.s3,
            Key: image[0].url
        }
        await s3.deleteObject(params).promise();
        await Image.delete(req.params.userId);
        res.status(204).send({ error:false, message: 'Image deleted' });
        return;
    }
    catch(err){
        console.log(err);
        res.status(400).send({ error:true, message: 'bad request' });
    }
};