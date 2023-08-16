import { Customer, Service } from "@prisma/client"
import databaseHandler from "../databaseHandler"
import { getIoInstance } from "./socket"

const prisma = databaseHandler

const newService = (data: NewServiceForm) => {}

const update = async (data: Customer & { services: Service[] }) => {
    const io = getIoInstance()

    const customer = await prisma.customer.update(data)
    if (customer) {
        io.emit("customer:update", customer)
    }
}

export default { update }
