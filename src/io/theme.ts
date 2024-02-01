// import { Socket } from "socket.io"
// import databaseHandler from "../databaseHandler"
// import { getIoInstance } from "."

// const list = async (socket: Socket) => {
//     const themes = await databaseHandler.theme.list()
//     console.log(themes)
//     socket.emit("theme:list", themes)
// }

// const create = async (socket: Socket, data: NewTheme) => {
//     const theme = await databaseHandler.theme.create(data)
//     console.log("new theme:")

//     socket.emit("theme:new:success", theme)
//     const io = getIoInstance()

//     io.emit("theme:new", theme)
// }

// const activate = async (socket: Socket, id: number) => {
//     await databaseHandler.theme.deactivate()
//     const theme = await databaseHandler.theme.activate(id)

//     socket.emit("theme:activate:success")
//     const io = getIoInstance()
//     io.emit("theme:activate", theme)
// }

// const deactivate = async (socket: Socket) => {
//     await databaseHandler.theme.deactivate()
//     socket.emit("theme:deactivate:success")
//     const io = getIoInstance()
//     io.emit("theme:deactivate")
// }

// const update = async (socket: Socket, data: NewTheme, id: number) => {
//     console.log("update theme")
//     console.log(id)
//     console.log(data)
//     const theme = await databaseHandler.theme.update(id, data)
//     socket.emit("theme:new:success", theme)
//     const io = getIoInstance()

//     io.emit("theme:new", theme)
// }

// export default { list, create, activate, deactivate, update }
