import { User, Warning } from "@prisma/client";
import { Socket } from "socket.io";
import databaseHandler from "../databaseHandler";
import { getIoInstance } from "./socket";

const create = async (socket: Socket, data: NewWarningForm) => {
  const io = getIoInstance();

  try {
    const warning = await databaseHandler.warning.create(data);
    socket.emit("warning:new:success", warning);
    io.emit("warning:new", warning);
  } catch (error) {
    console.log(error);
    socket.emit("warning:new:error", error);
  }
};

const confirm = async (
  socket: Socket,
  userId: number,
  warning: Warning & { confirmed: User[] }
) => {
  const io = getIoInstance();

  try {
    const updatedWarning = await databaseHandler.warning.confirm(
      userId,
      warning
    );
    io.emit("warning:update", updatedWarning);
    socket.emit("warning:confirm:success");
  } catch (error) {
    console.log(error);
    socket.emit("warning:confirm:error");
  }
};

export default { create, confirm };
