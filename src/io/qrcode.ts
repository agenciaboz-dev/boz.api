import { Socket } from "socket.io"
import { NewQrCodeForm } from "../definitions/NewQrCodeForm"
import databaseHandler from "../databaseHandler"
import { Customer, QrCode, User } from "@prisma/client"

const prisma = databaseHandler

const create = async (socket: Socket, data: NewQrCodeForm) => {
    const qrcode = await prisma.qrcode.new(data)
    socket.emit("qrcode:new:success")
}

const update = async (socket: Socket, data: QrCode & { user: User; customer: Customer }) => {
    const qrcode = await prisma.qrcode.update(data)
    socket.emit("qrcode:new:success")
}

const remove = async (socket: Socket, data: QrCode) => {
    const qrcode = await prisma.qrcode.delete(data)
    socket.emit("qrcode:delete:success", qrcode)
    socket.broadcast.emit("qrcode:delete", qrcode)
}

export default { new: create, update, remove }
