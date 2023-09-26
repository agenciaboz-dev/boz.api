import { User } from "@prisma/client"
import { Socket } from "socket.io"
import { cleanCoffeeList, clientList, coffeeList, getIoInstance } from "./socket"

const getCoffeeMaker = () => {
    console.log("getting maker")
    const io = getIoInstance()
    const users = clientList.map((item) => item.user)
    let tries = 20
    let speed = 500

    const interval = setInterval(() => {
        const user = users[Math.floor(Math.random() * users.length)]
        io.emit("coffee:maker", user)
        tries -= 1

        if (tries == 5) {
            speed = 1000
        }

        if (tries == 0) {
            clearInterval(interval)
            io.emit("coffee:maker", user)
            io.emit("coffee:making")
        }
    }, speed)
}

const startCoffeeLottery = () => {
    console.log("starting timer")
    const io = getIoInstance()

    let timer = 15
    io.emit("coffee:warning")

    const interval = setInterval(() => {
        io.emit("coffee:timer", timer)
        timer -= 1

        if (timer == 0) {
            clearInterval(interval)
            getCoffeeMaker()
        }
    }, 1000)
}

const wanting = (socket: Socket, user: User, wanting: boolean) => {
    const io = getIoInstance()
    cleanCoffeeList(user)

    if (wanting) coffeeList.push(user)

    console.log(coffeeList.map((item) => ({ id: item.id })))

    io.emit("coffee:list", coffeeList)

    if (coffeeList.length >= 3) {
        startCoffeeLottery()
    }
}

const ready = () => {
    const io = getIoInstance()
    cleanCoffeeList()

    io.emit("coffee:ready")
}

export default { wanting, ready }
