import express, { Express, Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { getIoInstance } from "../io/socket"
const router = express.Router()
const prisma = new PrismaClient()

router.get("/", async (request: Request, response: Response) => {
    response.json({ test: "success" })
})

router.post("/login", async (request: Request, response: Response) => {
    const data = request.body

    const user = await prisma.user.findFirst({
        where: {
            OR: [{ email: data.login }, { username: data.login }, { cpf: data.login }],
            AND: { password: data.password },
        },
        include: { roles: true, department: true },
    })

    response.json(user)
})

router.post("/delete", async (request: Request, response: Response) => {
    const io = getIoInstance()
    const data = request.body

    const user = await prisma.user.delete({ where: { id: data.id } })

    response.json(user)
    io.emit("user:delete", user)
})

export default router
