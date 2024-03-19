import { Socket } from "socket.io";
import { ClientBag } from "../definitions/client";
import { PrismaClient, Role, User } from "@prisma/client"
import { saveImage } from "../saveImage";
import databaseHandler from "../databaseHandler";
import { getIoInstance } from "./socket";
import { inclusions } from "../databaseHandler/user"

const prisma = databaseHandler
const prisma_client = new PrismaClient()

const logout = async (socket: Socket, clients: ClientBag, user: User) => {
    const io = getIoInstance()
    io.emit("user:disconnect", user)
    clients.remove(clients?.get(socket))

    prisma.log.status(user, 0)
}

const newUser = async (socket: Socket, newUser: any) => {
    const birth = newUser.birth.split("/").reverse().join("/")
    const roles = newUser.roles

    let user = await prisma_client.user.create({
        data: {
            birth: new Date(birth),
            cpf: newUser.cpf.replace(/\D/g, ""),
            email: newUser.email,
            name: newUser.name,
            phone: newUser.phone.replace(/\D/g, ""),
            password: newUser.username.toLowerCase(),
            username: newUser.username.toLowerCase(),
            departmentId: newUser.departmentId,
            roles: { connect: roles.map((role: Role) => ({ id: role.id })) },
            googleId: newUser.googleId,
        },
        include: inclusions.user,
    })

    if (user) {
        if (newUser.image) {
            saveImage(`users/${user.id}/images`, newUser.image, newUser.filename)
            user = await prisma.user.image({
                id: user.id,
                filename: newUser.filename,
            })
        }

        socket.emit("user:new:success", user)
        socket.broadcast.emit("user:new", user)
    } else {
        socket.emit("user:new:failed")
    }
}

const update = async (socket: Socket, data: any) => {
  let user = await prisma.user.update(data);

  if (user) {
    if (data.image) {
      saveImage(`users/${user.id}/images`, data.image, data.filename);
      user = await prisma.user.image(data);
    }

    socket.emit("user:update:success", user);
    socket.broadcast.emit("user:update", user);
  } else {
    socket.emit("user:update:failed");
  }
};

const status = (socket: Socket, user: User & { status: number; roles: Role[] }, clients: ClientBag) => {
    const io = getIoInstance()
    const client = clients.get(socket)
    if (client) {
        clients.update(client, user)
        io.emit("user:status:update", user)
        prisma.log.status(user, user.status)
    }
}

export default { logout, newUser, update, status };
