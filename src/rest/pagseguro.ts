import express, { Express, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
const router = express.Router()
const prisma = new PrismaClient()

router.post("/", async (request: Request, response: Response) => {
    try {
        const data = request.body

        console.log({ order: data })
    } catch (error) {
        console.log(error)
    }
})

export default router