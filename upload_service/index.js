import express from "express"
import uploadRouter from './routes/upload.routes.js'
import dotenv from "dotenv"
import cors from "cors"
import kafkaPublisherRouter from './routes/kafkapublisher.route.js'

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;
app.use(cors({
   allowedHeaders: ["*"],
   origin: "*"
}));
app.use(express.json());
app.use('/upload', uploadRouter);
app.use('/publish', kafkaPublisherRouter);



app.get('/', (req, res) => {
   res.send('HHLD YouTube')
})


app.listen(port, () => {
   console.log(`Server is listening at http://localhost:${port}`);
})
