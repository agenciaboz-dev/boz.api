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

export default { update }
