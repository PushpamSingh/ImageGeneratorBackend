import mongoose from "mongoose";

const transactionDataSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    credits:{
        type:Number,
        required:true
    },
    plan:{
        type:String,
        required:true
    },
    date:{
        type:Number
    }
},{timestamps:true})

export const TransactionData=mongoose.model('TransactionData',transactionDataSchema)