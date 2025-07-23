import express from "express";
import { JWTVerify } from "../Middlewares/Auth.middleware.js";
import { generateImg, paymentRazorpay, veriFyRazorpay } from "../Controllers/Image.controller.js";

const router=express.Router();
router.route("/generateImg").post(JWTVerify,generateImg)
router.route("/payrazorpay").post(JWTVerify,paymentRazorpay)
router.route("/veriFyRazorpay").post(JWTVerify,veriFyRazorpay)
export default router;