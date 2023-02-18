import finalhandler from "finalhandler";
import fs from "fs";
import http from "http";
import serveStatic from "serve-static";
import Log from "sublymus_logger";
import AuthController from "./App/Controllers/AuthController";
import { AloFiles } from "./lib/squery/Initialize";
import { SQuery } from "./lib/squery/SQuery";

let cookieBrut: string;
const serve = serveStatic(__dirname + "/Public");
const server = http.createServer(function (req, res) {
  if (req.url === "/") {
    fs.readFile(__dirname + "/Public/views/index.html", function (err, data) {
      const cookieHeader = req.headers.cookie;
      Log('server-cookies',cookieHeader )
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(data);
      cookieHeader?.split(";").forEach((element) => {
        if (element.includes("cookies")) {
          cookieBrut = element.trim();
        }
      });

      return res.end();
    });
  } else {
    const done = finalhandler(req, res);
    serve(req, res, done);
  }
});

// const modelPaths = ['user','account','profile'.'address'.'favorites'.'folder']
const io = SQuery.io(server);
io.on("connection", (socket: any) => {

  socket.request.headers["set-cookie"] = cookieBrut;

  const squery = SQuery(socket);
  socket.on("user", squery("user"));
  socket.on("account", squery("account"));
  socket.on("profile", squery("profile"));
  socket.on("address", squery("address"));
  socket.on("favorites", squery("favorites"));
  socket.on("folder", squery("folder"));
  socket.on("article", squery("article"));
  socket.on("login", async (data, cb) => {
    const authCtrl = new AuthController();
    const res = await authCtrl.login({
      data,
      __key: "",
      __permission: "user",
      action: "create",
      modelPath: "",
      socket,
    });
    cb(res);
  });
  socket.on("upload", (data, cb) => {
    Log("reseved", data[0].fileName);
    AloFiles.files = data;
    cb(data.length);
  });
  socket.on("_server:auth", (data, cb) => {});
});

const hostname = "127.0.0.1";
const port = 3502;
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
