import { Socket } from "socket.io"
import { ClientBag } from "../definitions/client"
import { PrismaClient, Role, User } from "@prisma/client"
import { saveImage } from "../saveImage"

const prisma = new PrismaClient()

const logout = async (socket: Socket, clients: ClientBag) => {
    clients.remove(clients?.get(socket))
}

const newUser = async (socket: Socket, clients: ClientBag, newUser: any) => {
    const splittedBirth = newUser.birth.split("/") as string[]
    const roles = newUser.roles as Role[]

    const user = await prisma.user.create({
        data: {
            birth: new Date(`${splittedBirth[1]}/${splittedBirth[0]}/${splittedBirth[2]}`),
            cpf: newUser.cpf,
            email: newUser.email,
            name: newUser.name,
            password: newUser.username,
            username: newUser.username,
            departmentId: newUser.departmentId,
            roles: { connect: roles.map((role) => ({ id: role.id })) },
        },
    })

    saveImage(`users/${user.id}/images`, newUser.image, "profilePic")

    socket.emit("user:new:success", user)
    socket.broadcast.emit("user:new", user)
}

export default { logout, newUser }
