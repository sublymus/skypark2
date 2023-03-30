import express from "express";
import path from "path";

import { SQuery } from "./lib/squery/SQuery";

const app = express();
const server = app.listen(3500, () => {
  console.log('Server running at http://localhost:3500/');
});

app.use(express.static(path.join(__dirname, "Public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Public/views/index.html"));
});

app.get("*", (req, res) => {
  const filePath = path.join(__dirname, "Public/views", req.path);
  res.sendFile(filePath);
});

const io = SQuery.io(server);

io.on("connection", (socket: any) => {
  console.log("user is connect");
  socket.on("disconnect", () => {
    console.log("user is disconnect");
  });
});
