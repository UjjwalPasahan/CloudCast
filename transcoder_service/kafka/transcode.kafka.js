import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv'

dotenv.config()

async function downloadFromS3(s3Url) {
    try {
        // Configure AWS
        const s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: 'eu-north-1'
        });

        // Parse the S3 URL more carefully
        const parsedUrl = new URL(s3Url);
        
        // Extract bucket and key
        const bucket = parsedUrl.hostname.replace('.s3.eu-north-1.amazonaws.com', '');
        const key = parsedUrl.pathname.startsWith('/') 
            ? parsedUrl.pathname.substring(1) 
            : parsedUrl.pathname;

        console.log('S3 Download Details:', { 
            bucket, 
            key, 
            fullUrl: s3Url 
        });

        // Verify file exists
        try {
            await s3.headObject({ 
                Bucket: bucket, 
                Key: key 
            }).promise();
        } catch (headError) {
            console.error('File verification failed:', {
                message: headError.message,
                code: headError.code
            });
            throw new Error(`File not found in S3: ${key}`);
        }

        // Download the file
        const params = {
            Bucket: bucket,
            Key: key
        };

        // Create downloads directory if it doesn't exist
        const downloadDir = path.join(process.cwd(), 'downloads');
        fs.mkdirSync(downloadDir, { recursive: true });

        // Generate unique filename
        const localFilePath = path.join(
            downloadDir, 
            `${Date.now()}_${path.basename(key)}`
        );

        // Download and save file
        const data = await s3.getObject(params).promise();
        fs.writeFileSync(localFilePath, data.Body);

        console.log('File downloaded successfully:', localFilePath);
        return localFilePath;

    } catch (error) {
        console.error('Comprehensive S3 Download Error:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        throw error;
    }
}

// Kafka consumer setup
async function setupKafkaConsumer() {
    const kafkaConfig = new KafkaConfig();

    try {
        await kafkaConfig.consume("transcode", async (value) => {
            try {
                console.log("Received data from Kafka:", value);
                await s3ToS3(value);  // Pass the raw Kafka message
            } catch (error) {
                console.error("Error processing Kafka message:", error);
            }
        });
    } catch (error) {
        console.error('Failed to set up Kafka consumer:', error);
    }
}

// Ensure environment variables are set
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('AWS credentials are missing. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    process.exit(1);
}

// Start the consumer
setupKafkaConsumer();