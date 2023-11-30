import express, { Express, Request, Response } from "express";
import role from "./role";
import databaseHandler from "../databaseHandler";
import { getIoInstance } from "../io/socket";

const router = express.Router();
const prisma = databaseHandler;

router.post("/new", async (request: Request, response: Response) => {
  const io = getIoInstance();

  const data = request.body;

  const department = await prisma.department.newDepartment(data);
  if (department) {
    io.emit("department:new", department);
    response.json(department);
  }
});

router.use("/role", role);

export default router;
