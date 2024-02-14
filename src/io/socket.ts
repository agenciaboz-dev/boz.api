import { Socket } from "socket.io";
import { Client, ClientBag } from "../definitions/client";
import { Customer, PrismaClient, Role, Service, Time, User } from "@prisma/client"
import user from "./user"
// import zap from "./zap"
import { Server as SocketIoServer } from "socket.io"
import { Server as HttpServer } from "http"
import { Server as HttpsServer } from "https"
import client from "./client"
import customer from "./customer"
import department from "./department"
import service from "./service"
import qrcode from "./qrcode"
import coffee from "./coffee"
import github from "../github"
import google from "../google"
import warning from "./warning"
import wakeup from "./wakeup"
// import theme from "./theme";
import project from "./project"
import { UpdateProjectForm } from "../definitions/UpdateProjectForm"
import { NewProjectForm, PlayProjectForm } from "../definitions/NewProjectForm"
import databaseHandler from "../databaseHandler"

export let clientList: Client[] = []
let io: SocketIoServer | null = null

export let coffeeList: User[] = []

export const cleanCoffeeList = (user?: User) => {
    if (user) {
        coffeeList = coffeeList.filter((item) => item.id != user.id)
    } else {
        coffeeList = []
    }
}

export const initializeIoServer = (server: HttpServer | HttpsServer) => {
    io = new SocketIoServer(server, {
        cors: { origin: "*" },
        maxHttpBufferSize: 1e8,
    })
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

// clean working projects without user
const cleanWorkingProjects = async () => {
    const prisma = new PrismaClient()
    const working = await prisma.time.findMany({ where: { ended: null, NOT: { worker_id: null } } })
    working.forEach(async (time) => {
        const user = await databaseHandler.user.find.worker(time.worker_id!)
        const client = clients.find(user!.id)
        if (!client || client.user.status != 1) {
            console.log(`stopping ${user?.name} work`)
            await prisma.time.update({ where: { id: time.id }, data: { ended: new Date().getTime().toString() } })
        }
    })
}

setInterval(() => cleanWorkingProjects(), 5 * 60 * 1000)
cleanWorkingProjects()

export const handleSocket = (socket: Socket) => {
    const io = getIoInstance()

    console.log(`new connection: ${socket.id}`)

    socket.on("disconnect", async (reason) => {
        console.log(`disconnected: ${socket.id}`)
        console.log({ reason })
        const client = clients.get(socket)

        const stopWork = (client: Client) => {
            const time = client.user.working_projects
                ?.find((item) => !!item.times.length && !item.times[item.times.length - 1].ended)
                ?.times.find((time) => !time.ended)

            if (time) {
                console.log("stopping user work")
                project.stop(socket, time, clients)
            }
        }

        if (client) {
            user.logout(socket, clients, client.user)

            if (client.user) {
                coffeeList = coffeeList.filter((user) => user.id != client.user.id)

                if (reason == "transport close") {
                    stopWork(client)
                }

                if (reason == "transport error" || reason == "ping timeout") {
                    console.log("disconnect because of error, stopping work on 5 minutes")
                    setTimeout(() => {
                        const _client = clients.find(client.user.id)
                        if (!_client) {
                            console.log("user still disconnected")
                            stopWork(client)
                        } else {
                            console.log("user is not disconnected, not stopping his work")
                        }
                    }, 5 * 60 * 1000)
                }
            }
        }
    })

    socket.on("client:sync", async (user: User & { status: number; roles: Role[] }) => client.sync(user, clients, socket))

    socket.on("user:logout", (data) => user.logout(socket, clients, data))

    socket.on("user:new", (newUser: User & { roles: Role[] }) => user.newUser(socket, newUser))
    socket.on("user:update", (data: User & { roles: Role[] }) => user.update(socket, data))
    socket.on("user:status:update", (data: User & { status: number }) => user.status(socket, data, clients))

    socket.on("customer:new", (data) => customer.create(socket, data))
    socket.on("customer:update", (data) => customer.update(socket, data))
    socket.on("customer:delete", (data) => customer.remove(socket, data))

    socket.on("service:update", (data) => service.update(socket, data))
    socket.on("service:delete", (data) => service.remove(socket, data))

    // socket.on("zap:sync", () => zap.sync(socket, clients))

    // socket.on("chat:sync", (chat) => zap.getChat(socket, chat))
    // socket.on("message:new", (data) => zap.sendMessage(socket, data))

    socket.on("department:update", (data) => department.update(socket, data))
    socket.on("department:delete", (data) => department.remove(socket, data))
    socket.on("department:sync", () => department.sync(socket))

    socket.on("qrcode:new", (data) => qrcode.new(socket, data))
    socket.on("qrcode:update", (data) => qrcode.update(socket, data))
    socket.on("qrcode:delete", (data) => qrcode.remove(socket, data))

    socket.on("coffee:wanting", (data) => coffee.wanting(socket, data.user, data.wanting))
    socket.on("coffee:ready", () => coffee.ready())

    socket.on("electron:update", async () => {
        const lastestRelease = await github.lastestRelease()
        io.emit("electron:latest", lastestRelease)
    })

    socket.on("google:login", (data) => google.login.login(socket, data))
    socket.on("google:exchange", (data) => google.login.exchangeCode(socket, data))
    socket.on("google:link", (user) => google.person.link(socket, user))
    // socket.on("google:calendar", (token) => google.calendar.getCalendar(socket, token))

    socket.on("warning:new", (data) => warning.create(socket, data))
    socket.on("warning:confirm", (data) => warning.confirm(socket, data.id, data.warning))

    socket.on("wakeup:create", (data) => wakeup.create(socket, data))
    socket.on("wakeup:update", (data) => wakeup.update(socket, data))
    socket.on("wakeup:delete", (data) => wakeup.remove(socket, data))
    socket.on("wakeup:request:new", (data) => wakeup.requests.create(socket, data))
    socket.on("wakeup:request:update", (data) => wakeup.requests.update(socket, data))
    socket.on("wakeup:request:delete", (data) => wakeup.requests.delete(socket, data))
    socket.on("wakeup:event:new", (data) => wakeup.events.create(socket, data))
    socket.on("wakeup:event:update", (data) => wakeup.events.update(socket, data))
    socket.on("wakeup:event:delete", (data) => wakeup.events.delete(socket, data))

    // socket.on("theme:list", () => theme.list(socket))
    // socket.on("theme:new", (data) => theme.create(socket, data))
    // socket.on("theme:activate", (data) => theme.activate(socket, data.id))
    // socket.on("theme:deactivate", () => theme.deactivate(socket))
    // socket.on("theme:update", (data) => theme.update(socket, data, data.id))

    socket.on("project:new", (data: NewProjectForm) => project.create(socket, data))
    socket.on("project:delete", (id: number) => project.remove(socket, id))
    socket.on("project:play", (data: PlayProjectForm) => project.play(socket, data, clients))
    socket.on("project:stop", (time: Time) => project.stop(socket, time, clients))
    socket.on("project:update", (data: UpdateProjectForm, id: number) => project.update(socket, data, id))
}
