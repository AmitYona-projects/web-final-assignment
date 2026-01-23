import dotenv from "dotenv";

const dotenvPath = process.env.LOAD_DEV_DOTENV ? ".env.dev" : ".env";

dotenv.config({ path: dotenvPath });
