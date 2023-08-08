"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSocket = void 0;
const handleSocket = (socket) => {
    console.log(`new connection: ${socket.id}`);
    socket.on("disconnect", () => {
        console.log(`disconnected: ${socket.id}`);
    });
};
exports.handleSocket = handleSocket;
