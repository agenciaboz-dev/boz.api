import express, { Express, Request, Response } from "express";
import databaseHandler from "../databaseHandler";
import { getIoInstance } from "../io/socket";

const router = express.Router();
const prisma = databaseHandler;

router.post("/new", async (request: Request, response: Response) => {
  const io = getIoInstance();

  const data = request.body;

  const service = await prisma.service.newService(data);
  if (service) {
    io.emit("service:new", service);
    response.json(service);
  }
});

export default router;
