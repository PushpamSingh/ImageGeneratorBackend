import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
import JWT from "jsonwebtoken"
dotenv.config()
const userSchema=new mongoose.Schema({
    fullName:{
        type:String,
        required:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        lowecase:true,
        trim:true
    },
    creditBalance:{
        type:Number,
        default:5
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    refreshToken:{
        type:String
    }
},{timestamps:true})

userSchema.pre('save',async function(next){
    const user=this
    if(!this.isModified('password')) return next()
    try {
        const salt=await bcrypt.genSalt(10);
        const hashPass=await bcrypt.hash(user.password,salt)
        user.password=hashPass
        next()
    } catch (error) {
        next(error)
        throw error
    }
})

userSchema.methods.ComparePassword=async function(userPassword){
    try {
        const isMatch=await bcrypt.compare(userPassword,this.password)
        return isMatch;
    } catch (error) {
        throw error;
    }
}

userSchema.methods.generateAccesstoken=async function(){
    return JWT.sign(
        {
            _id:this._id,
            email:this.email,
            name:"Image"
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshtoken=async function(){
    return JWT.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User=mongoose.model('User',userSchema)


