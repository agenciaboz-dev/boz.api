import express, { Express, Request, Response } from "express"
import user from "./src/user"

export const router = express.Router()

router.use("/user", user)
