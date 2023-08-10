import { Socket } from "socket.io"
import { ClientBag } from "../definitions/client"
import whatsapp from "../chat/whatsapp"

const zap = whatsapp

const sync = async (socket: Socket, clients: ClientBag) => {
    const client = await zap.client.getState()
    if (client) {
    } else {
        const qrcode = await zap.getQrCode()
        console.log({ qrcode })

        socket.emit("zap:qrcode", qrcode)
    }
}

export default { sync }
