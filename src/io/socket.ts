import { Socket } from "socket.io"
import { Client, ClientBag } from "../definitions/client"
import { Customer, Role, Service, User } from "@prisma/client"
import user from "./user"
import zap from "./zap"
import { Server as SocketIoServer } from "socket.io"
import { Server as HttpServer } from "http"
import { Server as HttpsServer } from "https"
import databaseHandler from "../databaseHandler"
import client from "./client"
import customer from "./customer"
import department from "./department"
import service from "./service"

const prisma = databaseHandler

let clientList: Client[] = []
let io: SocketIoServer | null = null

export const initializeIoServer = (server: HttpServer | HttpsServer) => {
    io = new SocketIoServer(server, { cors: { origin: "*" }, maxHttpBufferSize: 1e8 })
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

const update = (client: Client, user: User & { status: number }) =>
    (clientList = [...clientList.filter((item) => item.socket != client.socket), { ...client, user }])

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
        const user = clients.get(socket)?.user
        io.emit("user:disconnect", user)
        const client = clients.get(socket)
        clients.remove(client)
    })

    socket.on("client:sync", async (user: User & { status: number }) => client.sync(user, clients, socket))

    socket.on("user:logout", (data) => user.logout(socket, clients, data))

    socket.on("user:new", (newUser: User & { roles: Role[] }) => user.newUser(socket, newUser))
    socket.on("user:update", (data: User & { roles: Role[] }) => user.update(socket, data))
    socket.on("user:status:update", (data: User & { status: number }) => user.status(socket, data, clients))

    socket.on("customer:new", (data) => customer.create(socket, data))
    socket.on("customer:update", (data) => customer.update(socket, data))
    socket.on("customer:delete", (data) => customer.remove(socket, data))

    socket.on("service:update", (data) => service.update(socket, data))

    socket.on("zap:sync", () => zap.sync(socket, clients))

    socket.on("chat:sync", (chat) => zap.getChat(socket, chat))
    socket.on("message:new", (data) => zap.sendMessage(socket, data))

    socket.on("department:update", (data) => department.update(socket, data))
}
