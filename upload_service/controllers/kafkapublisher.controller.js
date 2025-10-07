
import KafkaConfig from "../kafka/kafka.js";

const sendMessageToKafka = async (req, res) => {
   console.log("got here in upload service...")
   try {
       const message = req.body
       console.log("body : ", message)
       const kafkaconfig = new KafkaConfig()
       const msgs = [
           {
               key: "key1",
               value: JSON.stringify(message)
           }
       ]
       const result = await kafkaconfig.produce("transcode", msgs)
       console.log("result of produce : ", result)
       res.status(200).json("message uploaded successfully")

   } catch (error) {
       console.log(error)
   }
}

export default sendMessageToKafka;

export const publishToKafka = async (title, url) => {
    try {
        console.log(`Attempting to publish message - Title: ${title}, URL: ${url}`);
        const kafkaconfig = new KafkaConfig();
        const messages = [
            { key: "video", value: JSON.stringify({ title, url }) },
        ];
        
        const result = await kafkaconfig.produce("transcode", messages);
        console.log("Kafka produce successful:", result);
        return result;
    } catch (error) {
        console.error("Detailed error publishing to Kafka:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        throw error;
    }
};


export const pushVideoURLToKafka = async (req, res) => {
    const { title, url } = req.body;
    try {
        await publishToKafka(title, url);
        res.send("Message uploaded successfully");
    } catch (error) {
        res.status(500).send("Failed to publish message to Kafka");
    }
};

