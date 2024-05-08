import { Customer, User } from "@prisma/client"

declare interface NewQrCodeForm {
    name: string
    code: string
    user: User
    customer: Customer
}
