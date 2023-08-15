import express, { Express, Request, Response } from "express"
import databaseHandler from "../databaseHandler"
import { getIoInstance } from "../io/socket"

const router = express.Router()
const prisma = databaseHandler

router.post("/new", async (request: Request, response: Response) => {
    const io = getIoInstance()

    const data = request.body

    const role = await prisma.role.new(data)
    if (role) {
        io.emit("role:new", role)
        response.json(role)
    }
})

export default router
