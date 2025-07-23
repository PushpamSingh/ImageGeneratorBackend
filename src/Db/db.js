import mongoose from "mongoose"
import dotenv from "dotenv"
import { DBConstant } from "../constant.js"
dotenv.config()

export const connectDB=async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URL}/${DBConstant}`);
        console.log("MonoDb Connected !! Host :: ",connectionInstance.connection.host);
    } catch (error) {
        console.log("Error :: DBConnection :: ",error);
        throw error
    }
}