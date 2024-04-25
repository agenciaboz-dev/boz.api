export interface WhatsappForm {
    number: string
    name: string
    template: string
}

export interface WhatsappApiForm {
    messaging_product: "whatsapp"
    to: string
    type: "template"
    template: {
        name: string
        language: {
            code: "en_US"
        }
    }
}
