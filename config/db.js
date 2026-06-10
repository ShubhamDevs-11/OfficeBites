const mongoose = require('mongoose');
const logger = require('../utils/logger.js');

const connectDb = async () => {
    try {
        
        const connect = await mongoose.connect(process.env.DATABASE_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })

        logger.info(`mongoDb is connected ${connect.connection.host}`);

        mongoose.connection.on('error', (err) => {
            logger.warn(`MongoDB Connection error: ${err.message}`)
        })

        mongoose.connection.on('disconnected', () => {
            logger.error(`MongoDB disconnected. Attemtping restart`);
        })

    } catch (error) {
        logger.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1);
    }
}

module.exports = connectDb;
