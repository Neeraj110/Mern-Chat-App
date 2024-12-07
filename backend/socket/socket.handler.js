import http from "http";
import { Server } from "socket.io";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("setup", (user) => {
    if (!user?._id) {
      console.log("Invalid user setup attempt:", user);
      return;
    }
    onlineUsers.set(socket.id, user._id);
    socket.join(user._id);
    socket.emit("connected");

    io.emit("onlineUsers", Array.from(onlineUsers.values()));
  });

  // Join a chat room
  socket.on("join chat", (room) => {
    if (!room) {
      console.log("Invalid room for chat join attempt:");
      return;
    }
    socket.join(room);
  });

  // Handle new message
  socket.on("new message", ({ message, room }) => {
    if (!room) {
      console.log("Invalid room for message:", room);
      return;
    }
    socket.to(room).emit("new message", message);
  });

  // Typing indicator
  socket.on("typing", (room) => {
    if (!room) return;
    socket.to(room).emit("typing");
  });

  socket.on("stop typing", (room) => {
    if (!room) return;
    socket.to(room).emit("stop typing");
  });

  // Disconnect events
  socket.on("disconnecting", () => {
    const rooms = Array.from(socket.rooms);
    const userId = onlineUsers.get(socket.id);
    rooms.forEach((room) => {
      socket.leave(room);
    });
  });

  socket.on("disconnect", () => {
    const userId = onlineUsers.get(socket.id);
    if (userId) {
      onlineUsers.delete(socket.id);
      io.emit("onlineUsers", Array.from(onlineUsers.values()));
    }
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

export { server, app };
