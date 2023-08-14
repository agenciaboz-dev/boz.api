import { Socket } from "socket.io"
import { ClientBag } from "../definitions/client"
import { Role, User } from "@prisma/client"
import { saveImage } from "../saveImage"
import databaseHandler from "../databaseHandler"
import { getIoInstance } from "./socket"

const prisma = databaseHandler

const logout = async (socket: Socket, clients: ClientBag, user: User) => {
    const io = getIoInstance()
    io.emit("user:disconnect", user)
    clients.remove(clients?.get(socket))
}

const newUser = async (socket: Socket, clients: ClientBag, newUser: any) => {
    const user = await prisma.user.new(newUser)

    if (user) {
        if (newUser.image) saveImage(`users/${user.id}/images`, newUser.image, "profilePic")

        socket.emit("user:new:success", user)
        socket.broadcast.emit("user:new", user)
    } else {
        socket.emit("user:new:failed")
    }
}

export default { logout, newUser }
