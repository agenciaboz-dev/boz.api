import express, { Express, Request, Response } from "express"
import service from "./service"

const router = express.Router()

router.use("/service", service)

export default router
