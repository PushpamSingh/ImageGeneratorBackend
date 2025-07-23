import { isValidObjectId } from "mongoose";
import { Asynhandler } from "../Utils/Asynchandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { User } from "../Models/User.models.js";
import axios from 'axios'
import dotenv from "dotenv";
import { ApiResponse } from "../Utils/ApiResponse.js";
import Razorpay from "razorpay";    
import { TransactionData } from "../Models/TransactionData.models.js";

dotenv.config()
const generateImg = Asynhandler(async (req, res) => {
    try {
        const { prompt } = req.body;
        const userId = req.user?._id;

        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid User Id")
        }
        if (!prompt) {
            throw new ApiError(400, "Prompt needed to generate image")
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(400, "User not found")
        }
        if (user.creditBalance <= 0) {
            throw new ApiError(403, "You don't have enough creditBalance to generate image")
        }

        const formData = new FormData()
        formData.append('prompt', prompt);


        const {data}=await axios.post(process.env.CLIPDROP_API_URL,formData, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY,
            },
           responseType:"arraybuffer"
        })

        const buffer64Image=Buffer.from(data,'binary').toString('base64')
        const ImageUrl=`data:image/png;base64,${buffer64Image}`
        
        await User.findByIdAndUpdate(
            userId,
            {
                $set:{
                    creditBalance:user.creditBalance-1
                }
            },
            {
                new:true
            }
        )

        res.status(200)
        .json(
            new ApiResponse(200,{ImageUrl,creditBalance:user.creditBalance},"Image generated")
        )
    } catch (error) {
        res.status(500)
            .json(
                new ApiError(500, error?.message)
            )
    }
})

const razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_API_KEY,
        key_secret:process.env.RAZORPAY_API_SECRET
})
const paymentRazorpay=Asynhandler(async(req,res)=>{
    try {
        const {planId}=req.body;
        const userId=req.user?._id
        if(!isValidObjectId(userId)){
            throw new ApiError(403,"Unauthorized invalid userId")
        }
        if(!(userId || planId)){
            throw new ApiError(400,"PlanId Is required")
        }

        const user= await User.findById(userId);
        if(!user){
            throw new ApiError(404,"user not found")
        }

        let credits,amount,plan,date

        switch (planId) {
            case 'Basic':
                credits=20
                amount=10
                plan='Basic'
                break;
            case 'Advanced':
                credits=100
                amount=50
                plan='Advanced'
                break;
            case 'Business':
                credits=500
                amount=250
                plan='Business'
                break;
            default:
                throw new ApiError(404,"Invalid planId!!")
        }
        date=Date.now();

        const transactionData={
            userId,amount,credits,plan,date
        }
        const newtransaction=await TransactionData.create(transactionData);

        const Option={
            amount:amount*100,
            currency:process.env.CURRENCY,
            receipt:newtransaction._id
        }

        await razorpayInstance.orders.create(Option,(error,order)=>{
            if(error){
                throw new ApiError(400,error?.message);
            }
            return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    order
                )
            )
        })


    } catch (error) {
         res.status(500)
            .json(
                new ApiError(500, error?.message)
            )
    }
})



export {generateImg,paymentRazorpay}