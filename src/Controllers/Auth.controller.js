import { Asynhandler } from "./../Utils/Asynchandler.js"
import { ApiError } from "./../Utils/ApiError.js"
import { User } from "../Models/User.models.js";
import { ApiResponse } from "../Utils/ApiResponse.js"
import { isValidObjectId } from "mongoose";

const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "user not found in generateToken")
        }
        const accessToken = await user.generateAccesstoken();
        const refreshToken = await user.generateRefreshtoken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
       throw error;
    }
}

const registerUser = Asynhandler(async (req, res) => {
    try {
        const { email, fullName, password } = req.body;
        if (!(email || fullName || password)) {
            throw new ApiError(404, "All Fields are required")
        }

        if (password.length < 6) {
            throw new ApiError(400, "Password must be at least 6 character")
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            throw new ApiError(400, "Invalid email Formate")
        }

        const existedUser = await User.findOne({ email });
        if (existedUser) {
            throw new ApiError(400, "User Already existed")
        }

        const newUser = await User.create({
            email,
            password,
            fullName
        })
        await newUser.save({ validateBeforeSave: false })

        const user = await User.findById(newUser._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(403, "User Not created")
        }

        res.status(200)
            .json(
                new ApiResponse(200, user, "User Register successfuly")
            )
    } catch (error) {
        res.status(500)
            .json(
                new ApiError(500, error?.message)
            )
    }
})

const Login = Asynhandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!(email || password)) {
            throw new ApiError(400, "All fields are required")
        }

        const isUser = await User.findOne({ email });
        if (!isUser) {
            throw new ApiError(404, "Incorrect email Id")
        }

        const isPasswordmatch = await isUser.ComparePassword(password)
        if (!isPasswordmatch) {
            throw new ApiError(400, "Invalid Credentials");
        }

        const { accessToken, refreshToken } = await generateTokens(isUser._id);

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            path: '/'
        }

        res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { user: isUser, accessToken, refreshToken },
                    "User Logged in successfuly"
                )
            )
    } catch (error) {
        res.status(500)
            .json(
                new ApiError(500, error?.message)
            )
    //    console.log("Eror: ",error);

    }
})

const Logout = Asynhandler(async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    refreshToken: null
                }
            },
            {
                new: true
            }
        )

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            path: '/'
        }
        res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User Log Out Successfuly"))
    } catch (error) {
        res.status(500)
            .json(
                new ApiError(500, error?.message)
            )
       
    }
})

const getUser = Asynhandler(async (req, res) => {
    try {
        const userId = req.user?._id
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "User not Authorized");
        }
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "user not found")
        }

        res.status(200)
            .json(
                new ApiResponse(
                    200,
                    user,
                    "User fetched successfuly"
                )
            )
    } catch (error) {
        res.status(500)
            .json(
                new ApiError(500, error?.message)
            )
    }
})

export {
    registerUser,
    Login,
    Logout,
    getUser
}