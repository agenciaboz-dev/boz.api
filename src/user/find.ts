import express, { Express, Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import databaseHandler from "../databaseHandler"

const router = express.Router()
const prisma = databaseHandler

router.post("/username", async (request: Request, response: Response) => {
    const data = request.body

    const user = prisma.user.find.username(data.username)
    response.json(user)
})

export default router
