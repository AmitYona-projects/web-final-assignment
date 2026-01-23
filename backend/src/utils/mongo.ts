import mongoose from "mongoose";
import { logger } from "./logger";
import config from "../config";

const { mongo } = config;

export const initializeMongo = async () => {
    logger.info("Connecting to Mongo...");

    await mongoose.connect(mongo.url);

    logger.info("Mongo connection established");
};
