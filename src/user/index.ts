import express, { Express, Request, Response } from "express"
import { getIoInstance } from "../io/socket"
import databaseHandler from "../databaseHandler"
import find from "./find"

const router = express.Router()
const prisma = databaseHandler

router.get("/", async (request: Request, response: Response) => {
    response.json({ test: "success" })
})

router.post("/login", async (request: Request, response: Response) => {
    const data = request.body

    const user = await prisma.user.login(data)
    if (user) {
        response.json({ ...user, status: 1 })
    } else {
        response.json(user)
    }
})

router.post("/delete", async (request: Request, response: Response) => {
    const io = getIoInstance()
    const data = request.body

    const user = await prisma.user.delete(data)

    response.json(user)
    io.emit("user:delete", user)
})

router.use("/find", find)

export default router
