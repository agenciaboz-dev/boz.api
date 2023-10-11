import { Warning } from "@prisma/client"
import { Socket } from "socket.io"
import databaseHandler from "../databaseHandler"
import { getIoInstance } from "./socket"

const create = async (socket: Socket, data: NewWarningForm) => {
    const io = getIoInstance()

    try {
        const warning = await databaseHandler.warning.create(data)
        socket.emit("warning:new:success", warning)
        io.emit("warning:new", warning)
    } catch (error) {
        console.log(error)
        socket.emit("warning:new:error", error)
    }
}

export default { create }
