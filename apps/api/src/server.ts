import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// loads env
dotenv.config();
const app = express();
app.use(helmet());  // security headers
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

app.use(express.json()); // for parsing application/json
app.use(morgan("dev")); // logging

// creating a health route
app.get("/health", (req: Request, res:Response)=>{
    res.json({ok: true})
})

const PORT = process.env.PORT || 4000;


app.listen(PORT, ()=>{
    console.log("API server is running on port", PORT);
})
