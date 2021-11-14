'use strict';
const Image = require('../models/image.model');
const aws = require('aws-sdk');
var config = require('../../config.json');
const log = require("../../logs")
const logger = log.getLogger('logs');
var SDC = require('statsd-client');
var Metrics = new SDC({port: 8125});

const s3 = new aws.S3();

exports.create = async function(req, res) {
    Metrics.increment('image.POST.uploadImage');
    try{
        const fileName = Date.now();
        const fileType = req.headers['content-type'].split('/')[1];
        const filePath = config.s3+"/"+req.params.userId+"/"+ fileName + "." + fileType;
        if(!(fileType=="png" || fileType=="jpg" || fileType=="jpeg")){
          return res.status(400).send({ error:true, message: 'Incorrect File Type' });
        }
        const params = {
          Bucket :config.s3,
          Key : filePath,
          Body : req.body
        }

        await s3.upload(params).promise();

        const image = await Image.findImage(req.params.userId);
        if(image.length!=0){
            const params = {
                Bucket: config.s3,
                Key: image[0].url
            }
            await s3.deleteObject(params).promise();
            await Image.delete(req.params.userId);
        }
        await Image.create(fileName,filePath,req.params.userId);
        const newImage = await Image.findImage(req.params.userId);
        logger.info("Uploaded new image for user with ID "+req.params.userId);
        res.status(201).json(newImage[0]);
        return;
    }
    catch(err){
        console.log(err);
        res.status(400).send({ error:true, message: 'bad request' });
    }
};

exports.getImage = async function(req, res) {
    Metrics.increment('image.GET.getImage');
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
    logger.info("retrieved image for user with ID "+req.params.userId);
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
    Metrics.increment('image.DELETE.deleteImage');
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
        logger.info("Deleted image for user with ID "+req.params.userId);
        res.status(204).send({ error:false, message: 'Image deleted' });
        return;
    }
    catch(err){
        console.log(err);
        res.status(400).send({ error:true, message: 'bad request' });
    }
};