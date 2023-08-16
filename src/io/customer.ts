import { Customer, Service } from "@prisma/client"
import databaseHandler from "../databaseHandler"
import { getIoInstance } from "./socket"
import { Socket } from "socket.io"

const prisma = databaseHandler

const newService = (data: NewServiceForm) => {}

const update = async (socket: Socket, data: Customer & { services: Service[] }) => {
    const io = getIoInstance()

    const customer = await prisma.customer.update(data)
    if (customer) {
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

export default { update, remove }
