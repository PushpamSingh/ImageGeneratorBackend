import express from "express";
import { JWTVerify } from "../Middlewares/Auth.middleware.js";
import { generateImg } from "../Controllers/Image.controller.js";

const router=express.Router();
router.route("/generateImg").post(JWTVerify,generateImg)
export default router;