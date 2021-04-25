const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 5000;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.status(200).sendFile("public/index.html");
});

io.on("connection", (socket) => {
  console.log(socket.id + "Connected...");

  socket.on("check", (room) => {
    let exists = io.sockets.adapter.rooms.get(room);
    if (exists === undefined) {
      console.log("Joining...");
      socket.join(room);
      socket.emit("waiting");
    } else {
      console.log("Found......");
      if (exists.size < 2) {
        console.log("Joining...");
        socket.join(room);
        socket.broadcast.to(room).emit("joined");
      } else {
        socket.emit("full");
      }
    }
  });

  socket.on("call", (data) => {
    let room = data.room;
    socket.broadcast.to(room).emit("call", data);
  });

  socket.on("answer", (data) => {
    let room = data.room;
    socket.broadcast.to(room).emit("answer", data);
  });

  socket.on("disconnecting", () => {
    let rooms = Array.from(socket.rooms);
    if (rooms.length > 1) {
      rooms.forEach((room) => {
        socket.broadcast.to(room).emit("closed");
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(socket.id + "Disconnected...");
  });
});

server.listen(port, () => {
  console.log("Listening At ::" + port);
});
