import axios, { AxiosError } from "axios"
import { WhatsappApiForm, WhatsappForm } from "../../definitions/WhatsappForm"
import { writeFileSync } from "fs"

const MAX_MESSAGES_BATCH = 50
const INTERVAL = 1000 * 60 * 60
// const INTERVAL = 20 * 1000

const token =
    "EAAEhE4xyg9cBO5JyT4rNPYB897H3THbQz6slZBBPUEQ0OaPpumZCIGhzL8rcfZAEZBoYUkcLaZA77PYOXLAs2G6aqzbosGbKBlJGMPRPaVRLEUxOmseO2nFo3egWPk8jCl8te0ZBCxv5ehHwbD4iLiTSY4r5nbjrtbPCXI7yfyVE8xggg3kdnSYZAbrlU6HurIQy66PpZBm7GWcDCBmb5cCMkzlJrWQZD"

export const api = axios.create({
    baseURL: "https://graph.facebook.com/v19.0/306058415918366",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
})

let whatsapp_stack: WhatsappForm[] = []

const getStack = () => whatsapp_stack

export const addMessageToStack = (message: WhatsappForm) => whatsapp_stack.push(message)

const isValidTime = () => {
    const now = new Date()
    if (now.getHours() >= 8) {
        return true
    }

    return false
}

const sendNextMessage = async () => {
    const stack = getStack()
    const message = stack.shift()

    if (message) {
        const form: WhatsappApiForm = {
            messaging_product: "whatsapp",
            template: {
                language: { code: message.language },
                name: message.template,
                components: message.components,
            },
            type: "template",
            to: "+55" + message.number.toString().replace(/\D/g, ""),
        }
        try {
            const whatsapp_response = await api.post("/messages", form)
            console.log(whatsapp_response.data)
            const log = `${new Date().toLocaleString("pt-br")}\n` + JSON.stringify(whatsapp_response.data) + "\n\n"
            writeFileSync("whatsapp_sent.log", log, { flag: "a+" })
        } catch (error) {
            if (error instanceof AxiosError) {
                console.log(error.response?.data)
                const log = `${new Date().toLocaleString("pt-br")}\n` + JSON.stringify(error.response?.data) + "\n\n"
                writeFileSync("whatsapp_error.log", log, { flag: "a+" })
            } else {
                console.log(error)
            }
        }
    }
}

const sendBatch = async () => {
    if (!isValidTime() || !getStack().length) return

    for (let index = 1; index <= MAX_MESSAGES_BATCH; index++) {
        try {
            sendNextMessage()
        } catch (error) {
            console.log(error)
        }
    }
}

setTimeout(() => sendBatch(), 1000 * 60)
setInterval(() => sendBatch(), INTERVAL)
