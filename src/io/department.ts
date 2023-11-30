import { Department } from "@prisma/client";
import databaseHandler from "../databaseHandler";
import { getIoInstance } from "./socket";
import { Socket } from "socket.io";

const prisma = databaseHandler;

const update = async (socket: Socket, data: Department) => {
  const io = getIoInstance();

  const department = await prisma.department.update(data);
  if (department) {
    io.emit("department:update", department);
    socket.emit("department:update:success");
  }
};

const remove = async (socket: Socket, data: Department) => {
  const io = getIoInstance();

  const department = await prisma.department.deleteDepartment(data);
  if (department) {
    io.emit("department:delete", department);
    socket.emit("department:delete:success");
  }
};

const sync = async (socket: Socket) => {
  const departments = await prisma.department.list();
  const roles = await prisma.role.list();

  socket.emit("roles:sync", roles);
  socket.emit("departments:sync", departments);
};

export default { update, remove, sync };
