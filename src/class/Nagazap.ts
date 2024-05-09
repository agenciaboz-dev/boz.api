import { Prisma } from "@prisma/client"
import { prisma } from "../prisma"
import axios, { AxiosError, AxiosInstance } from "axios"
import { getIoInstance } from "../io"
import { OvenForm, WhatsappApiForm, WhatsappForm, WhatsappTemplateComponent } from "../types/shared/Meta/WhatsappBusiness/WhatsappForm"
import { UploadedFile } from "express-fileupload"
import * as fs from "fs"

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

    static async get() {
        const data = await prisma.nagazap.findFirst()
        if (!data) throw "nagazap registry is missing"

        const nagazap = new Nagazap(data)
        return nagazap
    }

    constructor(data: NagazapPrisma) {
        this.id = data.id
        this.token = data.token
        this.appId = data.appId
        this.phoneId = data.phoneId
        this.bussinessId = data.bussinessId
        this.lastUpdated = data.lastUpdated
        this.stack = JSON.parse(data.stack)
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
        return message
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

    async newOven(data: OvenForm) {
        console.log(data)
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
            const whatsapp_response = await api.post(`/${this.phoneId}/messages`, form, { headers: this.buildHeaders() })
            console.log(whatsapp_response.data)
        } catch (error) {
            error instanceof AxiosError ? console.log(error.response?.data) : console.log(error)
        }
    }

    async prepareOven(data: OvenForm, image_id = "") {
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
            await this.sendMessage(message)
        })
    }
}
