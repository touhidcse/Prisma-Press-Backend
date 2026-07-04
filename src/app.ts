import cookieParser from "cookie-parser";
import express,{ Application, request, Request, response, Response } from "express";
import cors from "cors"
import config from "./config";
import { prisma } from "./lib/prisma";
import httpstatus from "http-status"
import bcrypt from "bcryptjs";
import { userRoutes } from "./modules/user/user.route";
import { authRoutes } from "./modules/auth/auth.routes";
import { postRoutes } from "./modules/post/post.routes";
import { commentRoutes } from "./modules/comment/comment.routes";

const app : Application = express()

app.use(cors({
    origin: config.app_url,
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser()) 

app.get("/", (req : Request,res: Response)=>{
    res.send("Hellow World")
})

// app.post()

app.use("/api/users", userRoutes)

app.use("/api/auth", authRoutes)

app.use("/api/posts",postRoutes)

app.use("/api/comments", commentRoutes)

export default app;