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

router.post("/update", async (request: Request, response: Response) => {
    const data = request.body as UserRoleForm

    const role = await databaseHandler.role.update(data, data.id)

    const io = getIoInstance()
    io.emit("role:new", role)
    response.json(role)
})

router.post("/delete", async (request: Request, response: Response) => {
    const data = request.body

    const deleted = await databaseHandler.role.remove(data.id)

    const io = getIoInstance()
    io.emit("role:delete", deleted)
    response.json(deleted)
})

export default router;
