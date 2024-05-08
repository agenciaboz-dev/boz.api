import express, { Express, Request, Response } from "express"
import axios from "axios"
const router = express.Router()

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

    if (data.method == "PATCH") {
        const apiResponse = await axios.patch(data.url, data.payload)
        delete apiResponse.request
        response.json(apiResponse)
    }

    if (data.method == "DELETE") {
        const apiResponse = await axios.delete(data.url, data.payload)
        delete apiResponse.request
        response.json(apiResponse)
    }
})

export default router
