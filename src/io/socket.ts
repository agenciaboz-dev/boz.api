import { Socket } from "socket.io"
import { Client, ClientBag } from "../definitions/client"
import { Role, User } from "@prisma/client"
import user from "./user"
import zap from "./zap"
import { Server as SocketIoServer } from "socket.io"
import { Server as HttpServer } from "http"
import { Server as HttpsServer } from "https"
import databaseHandler from "../databaseHandler"

const prisma = databaseHandler

let clientList: Client[] = []
let io: SocketIoServer | null = null

export const initializeIoServer = (server: HttpServer | HttpsServer) => {
    io = new SocketIoServer(server, { cors: { origin: "*" } })
}

export const getIoInstance = () => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized. Please call initializeIoServer first.")
    }
    return io
}

const get = (socket: Socket) => clientList.find((client) => client.socket == socket)
const find = (id: number) => clientList.find((client) => client.user.id == id)
const getUser = (client: Client) => client.user
const list = () => clientList.map((client) => client.user)

const remove = (client: Client | undefined) => {
    if (!client) return
    clientList = clientList.filter((item) => item.socket != client.socket)
}

const add = (client: Client) => {
    const exists = find(client.user.id)
    if (exists) remove(client)

    clientList.push(client)
}

const update = (client: Client, user: User) => (clientList = [...clientList.filter((item) => item.socket != client.socket), { ...client, user }])

const clients: ClientBag = {
    get,
    find,
    getUser,
    list,
    add,
    remove,
    update,
}

export const handleSocket = (socket: Socket) => {
    const io = getIoInstance()

    console.log(`new connection: ${socket.id}`)

    socket.on("disconnect", () => {
        console.log(`disconnected: ${socket.id}`)
        socket.broadcast.emit("user:disconnect", user)
        const client = clients.get(socket)
        clients.remove(client)
    })

    socket.on("client:sync", async (user: User) => {
        clients.add({ socket, user })

        io.emit("user:connect", user)

        console.log(`new client: ${user.username}`)

        const userList = await prisma.user.list()
        const users = userList.map((user) => {
            if (clients.find(user.id)) {
                console.log(`user ${user.username} is connected`)
                return { ...user, connected: true }
            }

            return user
        })

        socket.emit("client:sync", users)

        const departments = await prisma.department.list()
        socket.emit("departments:sync", departments)

        const roles = await prisma.role.list()
        socket.emit("roles:sync", roles)

        socket.broadcast.emit("user:sync", { ...user, connected: true })
    })

    socket.on("user:logout", (data) => user.logout(socket, clients, data))

    socket.on("user:new", (newUser: User & { roles: Role[] }) => user.newUser(socket, clients, newUser))

    socket.on("zap:sync", () => zap.sync(socket, clients))

    socket.on('chat:sync', chat => zap.getChat(socket, chat))
    socket.on("message:new", (data) => zap.sendMessage(socket, data))
}
