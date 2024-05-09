import { Prisma } from "@prisma/client"
import { prisma } from "../prisma"
import axios, { AxiosError, AxiosInstance } from "axios"
import { OvenForm, WhatsappApiForm, WhatsappForm, WhatsappTemplateComponent } from "../types/shared/Meta/WhatsappBusiness/WhatsappForm"
import { UploadedFile } from "express-fileupload"
import * as fs from "fs"
import { getIoInstance } from "../io/socket"

export type NagaMessagePrisma = Prisma.NagazapMessageGetPayload<{}>
export type NagaMessageForm = Omit<Prisma.NagazapMessageGetPayload<{}>, "id">
export type NagazapPrisma = Prisma.NagazapGetPayload<{}>
interface BuildHeadersOptions {
    upload?: boolean
}
export class NagaMessage {
    id: number
    from: string
    timestamp: string
    text: string
    name: string

    constructor(data: NagaMessagePrisma) {
        this.id = data.id
        this.from = data.from
        this.timestamp = data.timestamp
        this.text = data.text
        this.name = data.name
    }
}

const api = axios.create({
    baseURL: "https://graph.facebook.com/v19.0",
    // headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
})

export class Nagazap {
    id: number
    token: string
    appId: string
    phoneId: string
    bussinessId: string
    lastUpdated: string
    stack: WhatsappForm[]
    blacklist: string[]
    frequency: string
    batchSize: number
    lastMessageTime: string

    static async get() {
        const data = await prisma.nagazap.findFirst()
        if (!data) throw "nagazap registry is missing"

        const nagazap = new Nagazap(data)
        return nagazap
    }

    static async shouldBake() {
        try {
            const nagazap = await Nagazap.get()
            const lastTime = new Date(Number(nagazap.lastMessageTime))
            const now = new Date()
            if (now.getTime() >= lastTime.getTime() + Number(nagazap.frequency) && !!nagazap.stack.length) {
                nagazap.bake()
            }
        } catch (error) {
            console.log(error)
        }
    }

    constructor(data: NagazapPrisma) {
        this.id = data.id
        this.token = data.token
        this.appId = data.appId
        this.phoneId = data.phoneId
        this.bussinessId = data.bussinessId
        this.lastUpdated = data.lastUpdated
        this.stack = JSON.parse(data.stack)
        this.blacklist = JSON.parse(data.blacklist)
        this.frequency = data.frequency
        this.batchSize = data.batchSize
        this.lastMessageTime = data.lastMessageTime
    }

    async getMessages() {
        const data = await prisma.nagazapMessage.findMany()
        const messages = data.map((item) => new NagaMessage(item))
        return messages
    }

    async updateToken(token: string) {
        const data = await prisma.nagazap.update({ where: { id: this.id }, data: { token, lastUpdated: new Date().getTime().toString() } })
        this.token = data.token
        this.lastUpdated = data.lastUpdated
    }

    buildHeaders(options?: BuildHeadersOptions) {
        return { Authorization: `Bearer ${this.token}`, "Content-Type": options?.upload ? "multipart/form-data" : "application/json" }
    }

    async getInfo() {
        const response = await api.get(`/${this.bussinessId}?fields=id,name,phone_numbers`, {
            headers: this.buildHeaders(),
        })

        console.log(JSON.stringify(response.data, null, 4))
        return response.data
    }

    async saveMessage(data: NagaMessageForm) {
        const prisma_message = await prisma.nagazapMessage.create({
            data: {
                ...data,
                timestamp: (Number(data.timestamp) * 1000).toString(),
            },
        })

        const message = new NagaMessage(prisma_message)
        const io = getIoInstance()
        io.emit("nagazap:message", message)

        if (message.text.toLowerCase() == "parar promoções") {
            this.addToBlacklist(message.from)
        }
        return message
    }

    async addToBlacklist(number: string) {
        if (this.blacklist.includes(number)) return
        this.blacklist.push(number)
        await prisma.nagazap.update({ where: { id: this.id }, data: { blacklist: JSON.stringify(this.blacklist) } })
        console.log(`número ${number} adicionado a blacklist`)
    }

    async removeFromBlacklist(number: string) {
        if (!this.blacklist.includes(number)) return
        this.blacklist = this.blacklist.filter(item => item != number)
        await prisma.nagazap.update({ where: { id: this.id }, data: { blacklist: JSON.stringify(this.blacklist) } })
        console.log(`número ${number} removido da blacklist`)
    }

    async queueMessage(data: WhatsappForm) {
        this.stack.push(data)
        await prisma.nagazap.update({ where: { id: this.id }, data: { stack: JSON.stringify(this.stack) } })

        return this.stack
    }

    async getTemplates() {
        const response = await api.get(`/${this.bussinessId}?fields=id,name,message_templates`, {
            headers: this.buildHeaders(),
        })

        const templates = response.data.message_templates.data
        console.log(templates)
        return templates
    }

    async uploadMedia(file: UploadedFile, filepath: string) {
        const response = await api.post(
            `/${this.phoneId}/media`,
            {
                messaging_product: "whatsapp",
                type: file.mimetype,
                file: fs.createReadStream(filepath),
            },
            { headers: this.buildHeaders({ upload: true }) }
        )
        console.log(response.data.id)
        return response.data.id as string
    }

    async sendMessage(message: WhatsappForm) {
        const number = message.number.toString().replace(/\D/g, "")
        if (this.blacklist.includes(number.length == 10 ? number : number.slice(0, 2) + number.slice(3))) {
            console.log(`mensagem não enviada para ${number} pois está na blacklist`)
            return
        }

        const form: WhatsappApiForm = {
            messaging_product: "whatsapp",
            template: {
                language: { code: message.language },
                name: message.template,
                components: message.components,
            },
            type: "template",
            to: "+55" + number,
        }

        try {
            const whatsapp_response = await api.post(`/${this.phoneId}/messages`, form, { headers: this.buildHeaders() })
            console.log(whatsapp_response.data)
        } catch (error) {
            error instanceof AxiosError ? console.log(error.response?.data) : console.log(error)
        }
    }

    async prepareBatch(data: OvenForm, image_id = "") {
        const forms: WhatsappForm[] = data.to.map((number) => {
            return {
                number,
                template: data.template!.name,
                language: data.template!.language,
                components: data
                    .template!.components.filter((component) => component.format == "IMAGE")
                    .map((component) => {
                        const component_data: WhatsappTemplateComponent = {
                            type: component.type.toLowerCase() as "header" | "body" | "footer",
                            parameters: component.format == "IMAGE" ? [{ type: "image", image: { id: image_id } }] : [],
                        }
                        return component_data
                    }),
            }
        })

        forms.forEach(async (message) => {
            // replace this with the method for adding to stack instead of immediatly sending the message
            await this.queueMessage(message)
        })
    }

    async updateOvenSettings(data: { batchSize?: number; frequency?: string }) {
        const updated = await prisma.nagazap.update({ where: { id: this.id }, data })
        this.batchSize = updated.batchSize
        this.frequency = updated.frequency
    }

    async saveStack() {
        this.lastMessageTime = new Date().getTime().toString()
        const data = await prisma.nagazap.update({
            where: { id: this.id },
            data: { stack: JSON.stringify(this.stack), lastMessageTime: this.lastMessageTime },
        })

        const io = getIoInstance()
        io.emit("nagazap:update", this)
    }

    async bake() {
        for (let i = 0; i <= this.batchSize; i++) {
            const message = this.stack.shift()
            if (message) {
                await this.sendMessage(message)
            }
        }

        await this.saveStack()
    }
}
