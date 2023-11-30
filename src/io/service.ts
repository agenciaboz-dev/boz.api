import { Service } from "@prisma/client";
import { Socket } from "socket.io";
import { getIoInstance } from "./socket";
import databaseHandler from "../databaseHandler";

const prisma = databaseHandler;

const update = async (socket: Socket, data: Service) => {
  const io = getIoInstance();

  const service = await prisma.service.update(data);
  if (service) {
    io.emit("service:update", service);
    socket.emit("service:update:success", service);
  }
};

const remove = async (socket: Socket, data: Service) => {
  const io = getIoInstance();

  const service = await prisma.service.deleteService(data);
  if (service) {
    io.emit("service:delete", service);
    socket.emit("service:delete:success", service);
  }
};

export default { update, remove };
