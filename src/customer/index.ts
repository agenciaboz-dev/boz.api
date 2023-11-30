import express, { Express, Request, Response } from "express";
import service from "./service";
import { getIoInstance } from "../io/socket";
import databaseHandler from "../databaseHandler";

const router = express.Router();
const prisma = databaseHandler;

router.post("/new", async (request: Request, response: Response) => {
  const io = getIoInstance();

  const data = request.body;

  const customer = await prisma.customer.newCustomer(data);
  if (customer) {
    io.emit("customer:new", customer);
  }
  response.json(customer);
});

router.post("/toggleStatus", async (request: Request, response: Response) => {
  const io = getIoInstance();
  const data = request.body;

  const customer = await prisma.customer.toggleStatus(data);
  if (customer) {
    io.emit("customer:update", customer);
  }
  response.json(customer);
});

router.use("/service", service);

export default router;
