declare interface NewTheme {
    name: string
    userId: number

    primary: string
    secondary: string
    terciary: string
    success: string
    warning: string
    background: {
        primary: string
        secondary: string
    }
    text: {
        primary: string
        secondary: string
        terciary: string
    }
}
