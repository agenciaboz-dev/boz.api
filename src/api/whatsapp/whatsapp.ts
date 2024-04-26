import axios from "axios"
import { WhatsappApiForm, WhatsappForm } from "../../definitions/WhatsappForm"
import { writeFileSync } from "fs"

const MAX_MESSAGES_BATCH = 250
const INTERVAL = 3 * 60 * 60 * 1000
// const INTERVAL = 20 * 1000

const token =
    "EAAEhE4xyg9cBOZBP65vtjnnDfUmlnfB2bC5s9zWjIY9WkqoZAN73tWRCYcob2MDfpo1zg8LtCNEHKtKhTsYZBJb9sHO7aNdFCZAyOL1pVYpPdvWxKud1H8GoakFhm3CCY1UvWfLMDZBpjqpadqWVlHPiYsDaa31DnqPcV0IOzaIfbzzEcB9Ge1BWZBtS7Xc9O4oROZBHVcAZBpvNZBSefEF3S7JZAv541V"

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
            const log = `${new Date().toLocaleString("pt-br")}\n` + JSON.stringify(whatsapp_response.data) + "\n\n"
            writeFileSync("whatsapp_sent.log", log, { flag: "a+" })
        } catch (error) {
            console.log(error)
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

setInterval(() => sendBatch(), INTERVAL)