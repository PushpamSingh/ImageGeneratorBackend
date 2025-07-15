import { ApiError } from "./../Utils/ApiError.js"
import JWT from "jsonwebtoken"
import dotenv from "dotenv";
import { User } from "../Models/User.models.js";
dotenv.config()

export const JWTVerify = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization.replace("Bearer ", "")
        if (!token) {
            throw new ApiError(401, "UnAuthorized ! Token not found")
        }

        try {
            const decodeToken = await JWT.verify(token, process.env.ACCESS_TOKEN_SECRET)
            if (!decodeToken) {
                throw new ApiError(401, "UnAuthorized ! Invalid Token")
            }
            const user = await User.findById(decodeToken?._id).select('-password -refreshToken')
            if (!user) {
                throw new ApiError(404, "UnAuthorized ! you are not loggedin")
            }
            req.user = user;

        } catch (error) {
            throw new ApiError(403, error?.message)
        }

        next()

    } catch (error) {
        next(error)
        res.status(500)
            .json(
                new ApiError(500, error.message)
            )
    }
} 