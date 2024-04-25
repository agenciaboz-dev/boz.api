export interface WhatsappForm {
    number: string
    name: string
    template: string
    language: "en_US" | "pt_BR"
    components: WhatsappTemplateComponent[]
}

export interface WhatsappTemplateParams {
    type: "text" | "currency" | "date_time" | "image" | "document" | "video"
    text?: string
    currency?: string
    date_time?: string
    image?: string
    document?: string
    video?: string
}

export interface WhatsappTemplateComponent {
    type: "header" | "body" | "footer"
    parameters: WhatsappTemplateParams[]
}

export interface WhatsappApiForm {
    messaging_product: "whatsapp"
    to: string
    type: "template"
    template: {
        name: string
        language: {
            code: "en_US" | "pt_BR"
        }
        components: WhatsappTemplateComponent[]
    }
}
