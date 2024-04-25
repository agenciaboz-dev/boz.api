import axios from "axios"

const token =
    "EAAEhE4xyg9cBOZBP65vtjnnDfUmlnfB2bC5s9zWjIY9WkqoZAN73tWRCYcob2MDfpo1zg8LtCNEHKtKhTsYZBJb9sHO7aNdFCZAyOL1pVYpPdvWxKud1H8GoakFhm3CCY1UvWfLMDZBpjqpadqWVlHPiYsDaa31DnqPcV0IOzaIfbzzEcB9Ge1BWZBtS7Xc9O4oROZBHVcAZBpvNZBSefEF3S7JZAv541V"

export const api = axios.create({
    baseURL: "https://graph.facebook.com/v19.0/306058415918366",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
})
