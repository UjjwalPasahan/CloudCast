import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import KafkaConfig from './kafka/kafka.js';
import s3ToS3 from './HLS/transcode.js';

dotenv.config();
const app = express();
const port = 5000;

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

let urlS3ToS3; // Variable to store the URL from Kafka messages

const kafkaconfig = new KafkaConfig();
kafkaconfig.consume("transcode", async (value) => {
    try {
        console.log("Received data from Kafka:", value);
        urlS3ToS3 = value; // Update global variable
        await s3ToS3(value); // Process immediately
    } catch (error) {
        console.error("Error processing Kafka message:", error);
    }
});

app.get('/', (req, res) => res.send('Hello World!'));



app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
