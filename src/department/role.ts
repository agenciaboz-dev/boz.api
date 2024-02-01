import express, { Express, Request, Response } from "express";
import databaseHandler from "../databaseHandler";
import { getIoInstance } from "../io/socket";
import { PrismaClient } from "@prisma/client"

const router = express.Router();
const prisma = new PrismaClient()

router.get("/new", async (request: Request, response: Response) => {
  response.json({ success: true });
});

router.post("/new", async (request: Request, response: Response) => {
  const io = getIoInstance();

  const data = request.body;

  const role = await prisma.role.create({
      data: { name: data.name, tag: data.tag },
  })

  if (role) {
    io.emit("role:new", role);
    response.json(role);
  }
});

export default router;
