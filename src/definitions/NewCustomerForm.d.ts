import { Service } from "@prisma/client"

declare interface NewCustomerForm {
    name: string
    recomendations: string
    services: Service[]
}
