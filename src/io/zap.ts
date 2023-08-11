import { Socket } from "socket.io"
import { ClientBag } from "../definitions/client"
import whatsapp from "../chat/whatsapp"

const zap = whatsapp

const sync = async (socket: Socket, clients: ClientBag) => {
    const ready = await zap.client.getState()
    if (ready) {
        socket.emit("zap:loading", zap.client.info)
        socket.emit("zap:ready", await zap.getClient())
    } else {
        const qrcode = await zap.getQrCode()
        console.log({ qrcode })

        socket.emit("zap:qrcode", qrcode)
    }
}

const getChat = async (socket: Socket, _chat: any) => {
    const chatObj = await zap.client.getChatById(_chat.id._serialized)
    const messages = await chatObj.fetchMessages({ limit: 100 })
    const contact = await chatObj.getContact()
    const profilePic = await contact.getProfilePicUrl()

    const chat = { ...chatObj, profilePic, messages }
    socket.emit("chat:sync", chat)
}

export default { sync, getChat }
