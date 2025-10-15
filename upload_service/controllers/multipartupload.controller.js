import AWS from 'aws-sdk';
import prisma from '../lib/prisma.js';

// Initialize upload
export const initializeUpload = async (req, res) => {
    try {
        console.log('=== Initialize Upload ===');
        console.log('Request body:', req.body);

        const { filename } = req.body;

        if (!filename) {
            return res.status(400).json({
                error: 'Filename is required'
            });
        }

        console.log('Filename:', filename);

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
        console.log("Multipart params:", multipartParams);
        const uploadId = multipartParams.UploadId;

        res.status(200).json({ uploadId });
    } catch (err) {
        console.error('Error initializing upload:', err);
        res.status(500).json({
            error: 'Upload initialization failed',
            message: err.message
        });
    }
};

// Upload chunk
export const uploadChunk = async (req, res) => {
    try {
        console.log('=== Upload Chunk ===');
        const { filename, chunkIndex, uploadId } = req.body;

        console.log('Filename:', filename);
        console.log('Chunk Index:', chunkIndex);
        console.log('Upload ID:', uploadId);
        console.log('File buffer size:', req.file?.buffer?.length);

        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                error: 'No file chunk received'
            });
        }

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
        console.log("Upload part result:", data);

        res.status(200).json({
            success: true,
            ETag: data.ETag
        });
    } catch (err) {
        console.error('Error uploading chunk:', err);
        res.status(500).json({
            error: 'Chunk upload failed',
            message: err.message
        });
    }
};

// Complete upload - OPTIMIZED for Vercel timeout
export const completeUpload = async (req, res) => {
    let s3, bucketName, completeParams;

    try {
        console.log('=== Complete Upload ===');
        console.log('Request Body:', req.body);

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
                error: 'Missing required fields',
                required: ['filename', 'uploadId', 'title', 'author']
            });
        }

        s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: 'eu-north-1',
            httpOptions: {
                timeout: 30000 // 30 seconds
            }
        });
        bucketName = process.env.AWS_BUCKET;

        completeParams = {
            Bucket: bucketName,
            Key: filename,
            UploadId: uploadId,
        };

        // Listing parts
        console.log('Listing parts...');
        const data = await s3.listParts(completeParams).promise();
        console.log('Parts found:', data.Parts?.length);

        if (!data.Parts || data.Parts.length === 0) {
            return res.status(400).json({
                error: 'No parts found for this upload'
            });
        }

        const parts = data.Parts.map(part => ({
            ETag: part.ETag,
            PartNumber: part.PartNumber
        }));

        completeParams.MultipartUpload = { Parts: parts };

        // Completing multipart upload
        console.log('Completing multipart upload...');
        const uploadResult = await s3.completeMultipartUpload(completeParams).promise();

        const url = uploadResult.Location;
        console.log("Video uploaded at:", url);

        // Add video details to database
        console.log('Adding to database...');
        await addVideoDetailsToDB(title, description, author, url);

        // Return success immediately
        // Frontend will call /publish endpoint separately for Kafka
        res.status(200).json({
            success: true,
            message: "Uploaded successfully!!!",
            url: url,
            title: title
        });

    } catch (error) {
        console.error('Error completing upload:', error);

        // If S3 completion failed, try to abort the upload
        if (s3 && bucketName && completeParams?.UploadId) {
            try {
                await s3.abortMultipartUpload({
                    Bucket: bucketName,
                    Key: completeParams.Key,
                    UploadId: completeParams.UploadId
                }).promise();
                console.log('Aborted incomplete multipart upload');
            } catch (abortError) {
                console.error('Failed to abort upload:', abortError);
            }
        }

        return res.status(500).json({
            error: 'Upload completion failed',
            message: error.message,
            details: error.stack
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