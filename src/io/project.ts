import { Socket } from "socket.io"
import databaseHandler from "../databaseHandler"

const create = async (socket: Socket, data: NewProjectForm) => {
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

export default { create, list }
