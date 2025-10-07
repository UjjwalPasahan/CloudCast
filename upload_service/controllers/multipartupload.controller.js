
import AWS from 'aws-sdk';
import { PrismaClient } from '@prisma/client'
import { publishToKafka } from './kafkapublisher.controller.js';
const prisma = new PrismaClient()

// Initialize upload
export const initializeUpload = async (req, res) => {
   try {
       console.log('Initialising Upload');
       const {filename} = req.body;
       console.log(filename);
       const s3 = new AWS.S3({
           accessKeyId: process.env.AWS_ACCESS_KEY_ID,
           secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
           region: 'eu-north-1'
       });
       const bucketName = process.env.AWS_BUCKET;

       const createParams = {
           Bucket: bucketName,
           Key: filename,
           ContentType: 'video/mp4'
       };

       const multipartParams = await s3.createMultipartUpload(createParams).promise();
       console.log("multipartparams---- ", multipartParams);
       const uploadId = multipartParams.UploadId;

       res.status(200).json({ uploadId });
   } catch (err) {
       console.error('Error initializing upload:', err);
       res.status(500).send('Upload initialization failed');
   }
};

// Upload chunk
export const uploadChunk = async (req, res) => {
   try {
       console.log('Uploading Chunk');
       const { filename, chunkIndex, uploadId } = req.body;
       const s3 = new AWS.S3({
           accessKeyId: process.env.AWS_ACCESS_KEY_ID,
           secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
           region: 'eu-north-1'
       });
       const bucketName = process.env.AWS_BUCKET;

       const partParams = {
           Bucket: bucketName,
           Key: filename,
           UploadId: uploadId,
           PartNumber: parseInt(chunkIndex) + 1,
           Body: req.file.buffer,
       };

       const data = await s3.uploadPart(partParams).promise();
       console.log("data------- ", data);
       res.status(200).json({ success: true });
   } catch (err) {
       console.error('Error uploading chunk:', err);
       res.status(500).send('Chunk could not be uploaded');
   }
};

// Complete upload

export const completeUpload = async (req, res) => {
   try {
       console.log('Complete Upload Request Body:', req.body);
       const { 
           filename, 
           totalChunks, 
           uploadId, 
           title, 
           description, 
           author 
       } = req.body;    

       if (!filename || !uploadId || !title || !author) {
           return res.status(400).json({ 
               message: "Missing required fields" 
           });
       }

       const s3 = new AWS.S3({
           accessKeyId: process.env.AWS_ACCESS_KEY_ID,
           secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
           region: 'eu-north-1'
       });
       const bucketName = process.env.AWS_BUCKET;

       const completeParams = {
           Bucket: bucketName,
           Key: filename,
           UploadId: uploadId,
       };

       // Listing parts using promise
       const data = await s3.listParts(completeParams).promise();

       const parts = data.Parts.map(part => ({
           ETag: part.ETag,
           PartNumber: part.PartNumber
       }));

       completeParams.MultipartUpload = { Parts: parts };

       // Completing multipart upload using promise
       const uploadResult = await s3.completeMultipartUpload(completeParams).promise();

       const url = uploadResult.Location;
       console.log("Video uploaded at ", url);

       // Add video details to database
       await addVideoDetailsToDB(title, description, author, url);
       await publishToKafka(title,url);

       return res.status(200).json({ 
           message: "Uploaded successfully!!!",
           url: url 
       });

   } catch (error) {
       console.error('Error completing upload:', error);
       return res.status(500).json({ 
           message: 'Upload completion failed',
           error: error.message 
       });
   }
};

const addVideoDetailsToDB = async (title, description, author, url) => {
    console.log("Adding details to DB");
    try {
        const videoData = await prisma.videoData.create({
            data: {
                title,
                description: description || '',
                author,
                url
            }
        });
        console.log("Video data saved:", videoData);
        return videoData;
    } catch (error) {
        console.error("Error in adding to DB:", error);
        throw error;
    }
};