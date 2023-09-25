import { User } from "@prisma/client"
import { Socket } from "socket.io"
import { cleanCoffeeList, coffeeList, getIoInstance } from "./socket"

const wanting = (socket: Socket, user: User, wanting: boolean) => {
    const io = getIoInstance()
    cleanCoffeeList(user)

    if (wanting) coffeeList.push(user)

    console.log(coffeeList.map((item) => ({ id: item.id })))

    io.emit("coffee:list", coffeeList)
}

export default { wanting }
