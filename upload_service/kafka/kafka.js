import { Kafka } from "kafkajs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Emulate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class KafkaConfig {
    constructor() {
        this.kafka = new Kafka({
            clientId: "youtube uploader",
            brokers: process.env.Password,
            ssl: {
                ca: [fs.readFileSync(path.resolve(__dirname, "./ca.pem"), "utf-8")],
            },
            sasl: {
                username: process.env.AIVEN_USERNAME,
                password: process.env.pass,
                mechanism: "plain",
            },
        });
        this.producer = this.kafka.producer();
        this.consumer = this.kafka.consumer({ groupId: "youtube-uploader" });
    }

    async produce(topic, messages) {
        try {
            await this.producer.connect();
            console.log("Kafka producer connected.");

            console.log("Producing messages to topic:", topic, "with payload:", messages);

            await this.producer.send({
                topic: topic,
                messages: messages,
            });

            console.log("Message successfully produced to Kafka.");
        } catch (error) {
            console.error("Error producing messages to Kafka:", error);
        } finally {
            await this.producer.disconnect();
        }
    }


    async consume(topic, callback) {
        try {
            await this.consumer.connect();
            console.log(`Kafka consumer connected to topic "${topic}".`);
            await this.consumer.subscribe({ topic: topic, fromBeginning: true });
            await this.consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    const value = message.value.toString();
                    console.log(
                        `Received message from topic "${topic}" (Partition: ${partition}):`,
                        value
                    );
                    callback(value);
                },
            });
        } catch (error) {
            console.error("Error consuming messages from Kafka:", error);
        }
    }
}


export default KafkaConfig;
