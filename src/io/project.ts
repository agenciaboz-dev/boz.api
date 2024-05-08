import { Socket } from "socket.io"
import databaseHandler from "../databaseHandler"
import { Time } from "@prisma/client"
import { UpdateProjectForm } from "../types/UpdateProjectForm"
import { ClientBag } from "../types/client"
import { NewProjectForm, PlayProjectForm } from "../types/NewProjectForm"

const create = async (socket: Socket, data: NewProjectForm) => {
    try {
        const project = await databaseHandler.project.create(data)
        socket.emit("project:new:success", project)
        socket.broadcast.emit("project:new", project)

        const customer = await databaseHandler.customer.find(project.customer_id)
        socket.emit("customer:update", customer)
        socket.broadcast.emit("customer:update", customer)
    } catch (error) {
        console.log(error)
        socket.emit("project:new:error", error?.toString())
    }
}

const list = async (socket: Socket) => {
    const projects = await databaseHandler.project.list()
    socket.emit("project:list", projects)
}

const remove = async (socket: Socket, id: number) => {
    try {
        const deleted = await databaseHandler.project.remove(id)
        socket.emit("project:delete:success", deleted)
        socket.broadcast.emit("project:delete", deleted)

        const customer = await databaseHandler.customer.find(deleted.customer_id)
        socket.emit("customer:update", customer)
        socket.broadcast.emit("customer:update", customer)
    } catch (error) {
        console.log(error)
        socket.emit("project:delete:error", error?.toString())
    }
}

const play = async (socket: Socket, data: PlayProjectForm, clients: ClientBag) => {
    try {
        const worker = await databaseHandler.project.play(data)
        const project = await databaseHandler.project.find(data.project.id)
        let user = await databaseHandler.user.find.id(data.worker.user.id)
        if (user) {
            const client = clients.find(user.id)
            if (client) {
                user = { ...client.user, ...user }
                clients.update(client, { ...client.user, ...user })
            }
        }
        const customer = await databaseHandler.customer.find(data.project.customer_id)

        const response: PlayProjectForm = {
            customer: customer,
            project: project,
            role: data.role,
            worker: worker,
        }

        socket.emit("project:play:success", response)
        socket.emit("user:update", user)
        socket.emit("customer:update", customer)
        socket.broadcast.emit("customer:update", customer)

        socket.emit("project:update", project)
        socket.broadcast.emit("project:update", project)
    } catch (error) {
        console.log(error)
        socket.emit("project:play:error", error?.toString())
    }
}

const stop = async (socket: Socket, time: Time, clients: ClientBag) => {
    try {
        const updated_time = await databaseHandler.project.stop(time)
        if (updated_time.worker_id) {
            const project = await databaseHandler.project.findWorkerProject(updated_time.worker_id)
            socket.emit("project:stop:success", project)
            socket.broadcast.emit("project:stop", project)

            let user = await databaseHandler.user.find.worker(updated_time.worker_id)
            if (user) {
                const client = clients.find(user.id)
                if (client) {
                    user = { ...client.user, ...user }
                    clients.update(client, { ...client.user, ...user })
                }
            }
            socket.emit("user:update", user)

            if (project) {
                const customer = await databaseHandler.customer.find(project.customer_id)
                socket.emit("customer:update", customer)
                socket.broadcast.emit("customer:update", customer)

                socket.emit("project:update", project)
                socket.broadcast.emit("project:update", project)
            }
        }
    } catch (error) {
        console.log(error)
        socket.emit("project:stop:error", error?.toString())
    }
}

const update = async (socket: Socket, data: UpdateProjectForm, id: number) => {
    try {
        const project = await databaseHandler.project.update(data, id)
        socket.emit("project:new:success", project)
        socket.broadcast.emit("project:new", project)

        const customer = await databaseHandler.customer.find(project.customer_id)
        socket.emit("customer:update", customer)
        socket.broadcast.emit("customer:update", customer)
    } catch (error) {
        console.log(error)
        socket.emit("project:new:error", error?.toString())
    }
}

export default { create, list, remove, play, stop, update }
