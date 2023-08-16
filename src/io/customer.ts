import { Customer, Service } from "@prisma/client"
import databaseHandler from "../databaseHandler"
import { getIoInstance } from "./socket"
import { Socket } from "socket.io"
import { saveImage } from "../saveImage"

const prisma = databaseHandler

const create = async (socket: Socket, data: Customer & { services: Service[]; image: ArrayBuffer }) => {
    const io = getIoInstance()

    const customer = await prisma.customer.new(data)
    if (customer) {
        if (data.image) saveImage(`customers/${customer.id}/images`, data.image, "profilePic")

        io.emit("customer:new", customer)
        socket.emit("customer:new:success", customer)
    }
}

const update = async (socket: Socket, data: Customer & { services: Service[]; image: ArrayBuffer }) => {
    const io = getIoInstance()

    const customer = await prisma.customer.update(data)
    if (customer) {
        if (data.image) saveImage(`customers/${customer.id}/images`, data.image, "profilePic")

        io.emit("customer:update", customer)
        socket.emit("customer:update:success", customer)
    }
}

const remove = async (socket: Socket, data: Customer) => {
    const io = getIoInstance()

    const customer = await prisma.customer.delete(data)
    if (customer) {
        io.emit("customer:delete", customer)
        socket.emit("customer:delete:success", customer)
    }
}

export default { update, remove, create }
