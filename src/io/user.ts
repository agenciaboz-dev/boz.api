import { Socket } from "socket.io"
import { ClientBag } from "../definitions/client"

const logout = async (socket: Socket, clients: ClientBag) => {
    clients.remove(clients?.get(socket))
}

export default { logout }
