import express from 'express';
import { getUser, Login, Logout, registerUser } from '../Controllers/Auth.controller.js';
import { JWTVerify } from "../Middlewares/Auth.middleware.js"
const router=express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(Login);
router.route("/logout").post(JWTVerify,Logout);
router.route("/getuser").get(JWTVerify,getUser);

export default router;