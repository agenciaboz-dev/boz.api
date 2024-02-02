import { Role, User } from "@prisma/client"
import { Socket } from "socket.io"
import { ClientBag } from "../definitions/client"
import databaseHandler from "../databaseHandler"
import { coffeeList, getIoInstance } from "./socket"
import github from "../github"

const prisma = databaseHandler

const sync = async (user: User & { status: number; roles: Role[] }, clients: ClientBag, socket: Socket) => {
    const io = getIoInstance()
    //
    const projects = await prisma.project.list()
    socket.emit("project:list", projects)

    // const themes = await prisma.theme.list()
    // socket.emit("theme:list", themes)

    const lastestRelease = await github.lastestRelease()
    socket.emit("electron:latest", lastestRelease)

    const apis = await prisma.apiTester.list()
    socket.emit("wakeup:sync", apis)

    socket.emit("coffee:list", coffeeList)

    clients.add({ socket, user })
    io.emit("user:connect", user)

    const warnings = await prisma.warning.list()
    socket.emit("warning:list", warnings)

    console.log(`new client: ${user.username}`)

    const connected = clients.list()
    socket.emit("connected:sync", connected)

    const users = await prisma.user.list()
    socket.emit("client:sync", users)

    const departments = await prisma.department.list()
    socket.emit("departments:sync", departments)

    const roles = await prisma.role.list()
    socket.emit("roles:sync", roles)

    const services = await prisma.service.list()
    socket.emit("services:sync", services)

    const customers = await prisma.customer.list()
    socket.emit("customers:sync", customers)

    const selfLogs = await prisma.log.getUser(user.id)
    socket.emit("log:status:self", selfLogs)

    const qrcodes = await prisma.qrcode.list()
    socket.emit("qrcode:sync", qrcodes)

    if (user.roles.find((item) => item.tag == "admin")) {
        const statusLog = await prisma.log.list.status()
        socket.emit("log:status:sync", statusLog)
    }

    prisma.log.status(user, user.status)
}

export default { sync }
