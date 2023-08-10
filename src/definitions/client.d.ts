import { User } from "@prisma/client"
import { Socket } from "socket.io"

declare interface Client {
    socket: Socket
    user: User
}

declare interface ClientBag {
    get: (socket: Socket) => Client | undefined
    find: (id: number) => Client | undefined
    getUser: (client: Client) => User
    list: () => User[]
    add: (client: Client) => void
    remove: (client: Client | undefined) => void
    update: (client: Client, user: User) => Client[]
}
