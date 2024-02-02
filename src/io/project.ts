import { Socket } from "socket.io"
import databaseHandler from "../databaseHandler"
import { Time } from "@prisma/client"

const create = async (socket: Socket, data: NewProjectForm) => {
    console.log(data)
    try {
        const project = await databaseHandler.project.create(data)
        socket.emit("project:new:success", project)
        socket.broadcast.emit("project:new", project)
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
    } catch (error) {
        console.log(error)
        socket.emit("project:delete:error", error?.toString())
    }
}

const play = async (socket: Socket, worker_id: number) => {
    try {
        const worker = await databaseHandler.project.play(worker_id)
        const project = await databaseHandler.project.findWorkerProject(worker.id)
        socket.emit("project:play:success", project)
        socket.broadcast.emit("project:play:success", project)
    } catch (error) {
        console.log(error)
        socket.emit("project:play:error", error?.toString())
    }
}

const stop = async (socket: Socket, time: Time) => {
    try {
        const updated_time = await databaseHandler.project.stop(time)
        if (updated_time.worker_id) {
            const project = await databaseHandler.project.findWorkerProject(updated_time.worker_id)
            console.log(project)
            socket.emit("project:stop:success", project)
            socket.broadcast.emit("project:stop:success", project)
        }
    } catch (error) {
        console.log(error)
        socket.emit("project:stop:error", error?.toString())
    }
}

export default { create, list, remove, play, stop }
