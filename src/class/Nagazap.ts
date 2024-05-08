import { Prisma } from "@prisma/client"
import { prisma } from "../prisma"
import axios, { AxiosInstance } from "axios"
import { getIoInstance } from "../io"

export type NagaMessagePrisma = Prisma.NagazapMessageGetPayload<{}>
export type NagaMessageForm = Omit<Prisma.NagazapMessageGetPayload<{}>, "id">
export type NagazapPrisma = Prisma.NagazapGetPayload<{}>

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

    buildHeaders() {
        console.log(this.token)
        return { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" }
    }

    async getInfo() {
        const response = await api.get(`/${this.bussinessId}?fields=id,name,message_templates,phone_numbers`, {
            headers: this.buildHeaders(),
        })

        console.log(response.data)
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
}
