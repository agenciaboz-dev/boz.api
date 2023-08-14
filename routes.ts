import express, { Express, Request, Response } from "express"
import user from "./src/user"
import customer from "./src/customer"

export const router = express.Router()

router.use("/user", user)
router.use("/customer", customer)
