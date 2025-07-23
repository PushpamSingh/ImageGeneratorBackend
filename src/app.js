import express from "express"
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import cors from 'cors'

export const app=express()
dotenv.config()
app.use(cors({
   origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CORS_ORIGIN1,
      process.env.CORS_ORIGIN2,
      process.env.CORS_ORIGIN3
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
    credentials:true,
    optionsSuccessStatus: 200,
}))
app.set("trust proxy", 1) // trust first proxy
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({limit:"16kb",extended:true}))
app.use(express.static("public"))
app.use(cookieParser())

app.get('/',(req,res)=>{
    res.status(200).send("hello, Welcome to the Imgify");
})

import AuthRouter from "./Routes/Auth.route.js";
import ImageRouter from "./Routes/Image.route.js";

app.use("/api/v1/auth",AuthRouter)
app.use("/api/v1/img",ImageRouter)