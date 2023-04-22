import express from "express";
import path from "path";

import { Socket } from "socket.io";
import { SQuery } from "./lib/squery/SQuery";
const PORT = 3500;
const app = express();
const server = app.listen(PORT, () => {
  console.log('Server running at http://localhost:'+PORT);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Public/views/index.html"));
});
app.get("/test", (req, res) => {
  res.sendFile(path.join(__dirname, "Public/views/test.html"));
});

app.get("*", (req, res) => {
  if (req.path.startsWith('/tamp') || req.path.startsWith('/temp')) {
    return res.sendFile(path.join(__dirname, req.path));
  }
  const filePath = path.join(__dirname, "Public/views", req.path);
  res.sendFile(filePath);
});

const io = SQuery.io(server);
SQuery.emiter.when('ert', (val) => {
  console.log(val);

})
io.on("connection", (socket: Socket) => {
  SQuery.emiter.emit('ert', socket.id)
  console.log("user is connect");
  socket.on("disconnect", () => {
    console.log("user is disconnect");
  });
});



