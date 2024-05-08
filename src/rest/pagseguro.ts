import express, { Express, Request, Response } from "express"
const router = express.Router()

router.post("/", async (request: Request, response: Response) => {
    try {
        const data = request.body

        console.log({ order: data })
    } catch (error) {
        console.log(error)
    }
})

export default router
