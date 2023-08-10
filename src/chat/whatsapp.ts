import { Client, LocalAuth } from "whatsapp-web.js"

let qrCode = ""

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: "whatsapp.auth" }),
    puppeteer: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
})

client.on("qr", (qr) => {
    qrCode = qr
    console.log("whatsapp is disconnected. QrCode ready")
    // qrcode.generate(qr, { small: true })
})

client.on("ready", () => {
    console.log("whatsapp client is ready")
})

export default { qrCode, client }
