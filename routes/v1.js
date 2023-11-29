import express from "express";
import authRouter from "./v1/auth.js";


const router = express.Router();
router.use("/auth", authRouter);





export default router;