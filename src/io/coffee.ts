import { Role, User } from "@prisma/client"
import { Socket } from "socket.io"
import { cleanCoffeeList, clientList, coffeeList, getIoInstance } from "./socket"

const getCoffeeUsers = () => {
    const users = clientList.map((item) => item.user).filter((user) => user.status == 1 && user.roles.find((role) => role.tag == "café"))

    const interns = users.filter((user) => user.roles.find((role) => role.tag == "estagiário"))

    // users.map(user => {
    //     // if (user)
    // })

    return [...users, ...interns, ...interns]
}

const getCoffeeMaker = () => {
    console.log("getting maker")
    const io = getIoInstance()
    const users = getCoffeeUsers()

    let tries = 20
    let speed = 500

    const interval = setInterval(() => {
        let user = users[Math.floor(Math.random() * users.length)]
        io.emit("coffee:maker", user)
        tries -= 1

        if (tries == 5) {
            speed = 1000
        }

        if (tries == 0) {
            clearInterval(interval)
            const troll = users.find((user) => user.username == "livia" && user.status == 1)
            if (troll) user = troll

            io.emit("coffee:maker", user)
            setTimeout(() => {
                io.emit("coffee:making")
            }, 1000)
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
