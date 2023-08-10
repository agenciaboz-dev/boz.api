import express, { Express, Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
const router = express.Router()
const prisma = new PrismaClient()

router.get("/", async (request: Request, response: Response) => {
    response.json({ test: "success" })
})

router.post("/login", async (request: Request, response: Response) => {
    const data = request.body

    const user = await prisma.user.findFirst({
        where: {
            OR: [{ email: data.login }, { username: data.login }],
            AND: { password: data.password },
        },
        include: { roles: true },
    })

    response.json(user)
})

export default router
