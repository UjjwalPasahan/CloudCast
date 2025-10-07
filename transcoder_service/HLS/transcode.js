import dotenv from "dotenv";
import AWS from 'aws-sdk';
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg"
import ffmpegStatic from "ffmpeg-static"

ffmpeg.setFfmpegPath(ffmpegStatic)

dotenv.config();

const s3 = new AWS.S3({
   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3ToS3 = async (message) => {
   console.log('Starting script');
   console.time('req_time');
   try {
       // Parse the JSON message
       const messageObj = JSON.parse(message);
       const urlS3ToS3 = messageObj.url;

       // Parse the URL to extract bucket and key
       const parsedUrl = new URL(urlS3ToS3);
       const bucketName = parsedUrl.hostname.split('.')[0];
       const mp4FileName = path.basename(parsedUrl.pathname);
       const hlsFolder = 'hls';

       // Ensure HLS folder exists
       if (!fs.existsSync(hlsFolder)) {
           fs.mkdirSync(hlsFolder, { recursive: true });
           console.log(`Created HLS folder: ${hlsFolder}`);
       }

       console.log('Downloading s3 mp4 file locally');
       const writeStream = fs.createWriteStream('local.mp4');
       const readStream = s3
           .getObject({ 
               Bucket: bucketName, 
               Key: decodeURIComponent(mp4FileName) 
           })
           .createReadStream();
       
       await new Promise((resolve, reject) => {
           readStream.pipe(writeStream);
           writeStream.on('finish', resolve);
           writeStream.on('error', reject);
       });
       console.log('Downloaded s3 mp4 file locally');

       const resolutions = [
           {
               resolution: '320x180',
               videoBitrate: '500k',
               audioBitrate: '64k'
           },
           {
               resolution: '854x480',
               videoBitrate: '1000k',
               audioBitrate: '128k'
           },
           {
               resolution: '1280x720',
               videoBitrate: '2500k',
               audioBitrate: '192k'
           }
       ];

       const variantPlaylists = [];
       for (const { resolution, videoBitrate, audioBitrate } of resolutions) {
           console.log(`HLS conversion starting for ${resolution}`);
           const outputFileName = `${mp4FileName.replace(/\.[^/.]+$/, '')}_${resolution}.m3u8`;
           const segmentFileName = `${mp4FileName.replace(/\.[^/.]+$/, '')}_${resolution}_%03d.ts`;
           
           try {
               await new Promise((resolve, reject) => {
                   ffmpeg('./local.mp4')
                       .outputOptions([
                           `-c:v h264`,
                           `-b:v ${videoBitrate}`,
                           `-c:a aac`,
                           `-b:a ${audioBitrate}`,
                           `-vf scale=${resolution}`,
                           `-f hls`,
                           `-hls_time 10`,
                           `-hls_list_size 0`,
                           `-hls_segment_filename hls/${segmentFileName}`
                       ])
                       .output(`hls/${outputFileName}`)
                       .on('start', (commandLine) => {
                           console.log('Spawned FFmpeg with command: ' + commandLine);
                       })
                       .on('end', () => {
                           console.log(`HLS conversion completed for ${resolution}`);
                           resolve();
                       })
                       .on('error', (err) => {
                           console.error(`Error during FFmpeg conversion for ${resolution}:`, err);
                           reject(err);
                       })
                       .run();
               });

               const variantPlaylist = {
                   resolution,
                   outputFileName
               };
               variantPlaylists.push(variantPlaylist);
               console.log(`HLS conversion done for ${resolution}`);
           } catch (conversionError) {
               console.error(`Failed to convert resolution ${resolution}:`, conversionError);
               // Continue with other resolutions or handle as needed
           }
       }

       // Generate master playlist
       console.log(`HLS master m3u8 playlist generating`);
       let masterPlaylist = variantPlaylists
           .map((variantPlaylist) => {
               const { resolution, outputFileName } = variantPlaylist;
               const bandwidth =
                   resolution === '320x180'
                       ? 676800
                       : resolution === '854x480'
                       ? 1353600
                       : 3230400;
               return `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n${outputFileName}`;
           })
           .join('\n');
       masterPlaylist = `#EXTM3U\n` + masterPlaylist;

       const masterPlaylistFileName = `${mp4FileName.replace(/\.[^/.]+$/, '')}_master.m3u8`;
       const masterPlaylistPath = path.join(hlsFolder, masterPlaylistFileName);
       fs.writeFileSync(masterPlaylistPath, masterPlaylist);
       console.log(`HLS master m3u8 playlist generated`);

       // Upload to S3
       console.log(`Uploading media m3u8 playlists and ts segments to s3`);
       const files = fs.readdirSync(hlsFolder);
       
       for (const file of files) {
           // Only upload files related to this specific video
           if (!file.startsWith(mp4FileName.replace(/\.[^/.]+$/, ''))) {
               continue;
           }

           const filePath = path.join(hlsFolder, file);
           const fileStream = fs.createReadStream(filePath);
           
           const uploadParams = {
               Bucket: bucketName,
               Key: `hls/${file}`,
               Body: fileStream,
               ContentType: file.endsWith('.ts')
                   ? 'video/mp2t'
                   : file.endsWith('.m3u8')
                   ? 'application/x-mpegURL'
                   : null
           };

           try {
               await s3.upload(uploadParams).promise();
               console.log(`Uploaded ${file} to S3`);
               
               // Delete local file after successful upload
               fs.unlinkSync(filePath);
               console.log(`Deleted local file: ${file}`);
           } catch (uploadError) {
               console.error(`Failed to upload ${file}:`, uploadError);
           }
       }

       // Clean up local files
       try {
           fs.unlinkSync('local.mp4');
           console.log(`Deleted locally downloaded s3 mp4 file`);
       } catch (deleteError) {
           console.error('Error deleting local mp4:', deleteError);
       }

       console.log('Success. Time taken: ');
       console.timeEnd('req_time');
       
       return {
           success: true,
           masterPlaylist: masterPlaylistFileName,
           variantPlaylists: variantPlaylists.map(vp => vp.outputFileName)
       };

   } catch (error) {
       console.error('Comprehensive Error:', {
           message: error.message,
           code: error.code,
           stack: error.stack
       });
       throw error;
   }
};



export default s3ToS3;

