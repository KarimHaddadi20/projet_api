//v1.js
import express from "express";
import authRouter from "./v1/auth.js";
import secretRouter from "./v1/secret.js";



const router = express.Router();
router.use("/auth", authRouter);
router.use("/secret", secretRouter);




export default router;