import { Socket } from "socket.io"
import { Client, ClientBag } from "../definitions/client"
import { User } from "@prisma/client"
import user from "./user"

let clientList: Client[] = []

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
    console.log(`new connection: ${socket.id}`)

    socket.on("disconnect", () => {
        console.log(`disconnected: ${socket.id}`)
        const client = clients.get(socket)
        clients.remove(client)
    })

    socket.on("client:sync", (user: User) => {
        clients.add({ socket, user })
        console.log(`new client: ${user.username}`)
        const users = clients.list()

        socket.emit("client:sync", users)
    })

    socket.on("user:logout", () => user.logout(socket, clients))
}
