export let env: "dev" | "prod" = "dev"
export const website_url = "https://app.agenciaboz.com.br"

export const setProd = () => {
    env = "prod"
}
