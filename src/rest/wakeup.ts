import express, { Express, Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import axios from "axios"
const router = express.Router()
const prisma = new PrismaClient()

router.post("/", async (request: Request, response: Response) => {
    const data = request.body
    console.log(data)

    if (data.method == "GET") {
        const apiResponse = await axios.get(data.url)
        delete apiResponse.request
        response.json(apiResponse)
    }

    if (data.method == "POST") {
        const apiResponse = await axios.post(data.url, data.payload)
        delete apiResponse.request
        response.json(apiResponse)
    }
})

export default router
