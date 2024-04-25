import express, { Express, Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { WhatsappApiForm, WhatsappForm } from "../definitions/WhatsappForm"
import { api as zapApi } from "../api/whatsapp/whatsapp"
import { AxiosError } from "axios"

const router = express.Router()
const prisma = new PrismaClient()

export const getNumbers = (original_number: string | number) => {
    const number = `55${original_number}@c.us`

    const prefix = number.slice(2, 4)
    const number2 = `55${prefix + number.slice(5)}`
    return [number, number2]
}

// router.post("/", async (request: Request, response: Response) => {
//     const ready = await whatsapp.client.getState()
//     if (ready) {
//         const data = request.body
//         const [number, number2] = getNumbers(data.number)

//         const message = await whatsapp.client.sendMessage(number, data.message, { linkPreview: true })
//         const message2 = await whatsapp.client.sendMessage(number2, data.message, { linkPreview: true })
//         // const signing = await prisma.contracts.findFirst({where: {phone: data.number}, orderBy:{id:"desc"}}) || await prisma.users.findFirst({where: {phone: data.number}})

//         response.json({ message, message2 })
//     }
// })

router.post("/", async (request: Request, response: Response) => {
    const data = request.body as WhatsappForm

    try {
        console.log(data)
        const form: WhatsappApiForm = {
            messaging_product: "whatsapp",
            template: {
                language: { code: data.language },
                name: data.template,
                components: data.components,
            },
            type: "template",
            to: "+55" + data.number.toString().replace(/\D/g, ""),
        }
        const whatsapp_response = await zapApi.post("/messages", form)
        console.log(whatsapp_response.data)
    } catch (error) {
        if (error instanceof AxiosError) {
            console.log(error.response?.data)
        } else {
            console.log(error)
        }
        response.status(500).send(error)
    }
})

export default router
