import { isValidObjectId } from "mongoose";
import { Asynhandler } from "../Utils/Asynchandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { User } from "../Models/User.models.js";
import axios from 'axios'
import dotenv from "dotenv";
import { ApiResponse } from "../Utils/ApiResponse.js";

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
                    creditBalance:creditBalance-1
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

export {generateImg}