import { Time, User, Worker } from "@prisma/client"
import { Socket } from "socket.io"

declare interface Client {
    socket: Socket
    user: User & { status: number; roles: Role[] } & { working_projects?: (Worker & { times: Time[] })[] }
}

declare interface ClientBag {
    get: (socket: Socket) => Client | undefined
    find: (id: number) => Client | undefined
    getUser: (client: Client) => User
    list: () => User[]
    add: (client: Client) => void
    remove: (client: Client | undefined) => void
    update: (client: Client, user: User & { status: number; roles: Role[] }) => Client[]
}
