// this page holds environment variables for the api server

import dotenv from 'dotenv';
dotenv.config(); // load .env variables into process.env

export const config = {
    port: process.env.PORT || 4000,
    databaseUrl: process.env.DATABASE_URL!,
    nodeEnv: process.env.NODE_ENV || "development"
}