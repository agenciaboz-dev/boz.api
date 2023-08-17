import { Socket } from "socket.io"
import { NewQrCodeForm } from "../definitions/NewQrCodeForm"
import databaseHandler from "../databaseHandler"

const prisma = databaseHandler

const create = async (socket: Socket, data: NewQrCodeForm) => {
    const qrcode = await prisma.qrcode.new(data)
    socket.emit("qrcode:new:success")
}

export default { new: create }
