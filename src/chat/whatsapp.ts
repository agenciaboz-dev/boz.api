import { Client, LocalAuth } from "whatsapp-web.js"
import { getIoInstance } from "../io/socket"

let qrCode = ""
let qrCodeResolver: (value: string) => void

const qrCodePromise = new Promise((resolve) => {
    qrCodeResolver = resolve
})

const getQrCode = () => qrCodePromise

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: "whatsapp.auth" }),
    puppeteer: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
})

client.on("qr", (qr) => {
    qrCode = qr
    qrCodeResolver(qrCode)
    console.log("whatsapp is disconnected. QrCode ready: " + qrCode)
    // qrcode.generate(qr, { small: true })

    const io = getIoInstance()
    io.emit("zap:qrcode", qrCode)
})

client.on("ready", () => {
    console.log("whatsapp client is ready")
})

export default { getQrCode, client }
