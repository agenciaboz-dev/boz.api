import { Socket } from "socket.io"
import databaseHandler from "../databaseHandler"
import { getIoInstance } from "./socket"
import { ApiTester } from "@prisma/client"

const create = async (socket: Socket, data: ApiTesterForm) => {
    try {
        const api = await databaseHandler.apiTester.create(data)
        const io = getIoInstance()

        socket.emit("wakeup:create:success", api)
        io.emit("wakeup:new", api)
    } catch (error) {
        console.log(error)
        socket.emit("wakeup:create:error", error)
    }
}

const update = async (socket: Socket, data: ApiTester) => {
    console.log(data)
    try {
        const api = await databaseHandler.apiTester.update(data)
        const io = getIoInstance()
        io.emit("wakeup:update", api)
    } catch (error) {
        console.log(error)
        socket.emit("wakeup:update:error", error)
    }
}

const remove = async (socket: Socket, data: ApiTester) => {
    try {
        const api = await databaseHandler.apiTester.remove(data)
        const io = getIoInstance()

        io.emit("wakeup:delete", { id: api.id })
    } catch (error) {
        console.log(error)
    }
}

export default { create, update, remove }
