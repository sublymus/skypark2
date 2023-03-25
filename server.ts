
import finalhandler from "finalhandler";

import fs from "fs";
import http from "http";
import mime from "mime-types";
import path from "path";

import serveStatic from "serve-static";
import { SQuery } from "./lib/squery/SQuery";

let cookieBrut: string;
const serve = serveStatic(__dirname + "/Public");
const server = http.createServer(function (req, res) {

  const headers = {
    'Access-Control-Allow-Origin': '*', /* @dev First, read about security */
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Max-Age': 2592000, // 30 days
    "Content-Type": "index.html"
  };

  if (req.url === "/") {
    fs.readFile(__dirname + "/Public/views/test.html", function (err, data) {
      const cookieHeader = req.headers.cookie;
      res.writeHead(200,headers);
      res.write(data);
      cookieHeader?.split(";").forEach((element) => {
        if (element.includes("cookies")) {
          cookieBrut = element.trim();
        }
      });

      return res.end();
    });
  } else {
    let filePath = ''
    if (req.url.startsWith('/tamp') || req.url.startsWith('/temp')) {
      filePath = path.join(__dirname, req.url);
    } else {
      filePath = path.join(__dirname, "Public/views", req.url);
    }
    const done = finalhandler(req, res);
    const contentType = mime.contentType(path.extname(filePath));
    res.writeHead(200, { "Content-Type": contentType });
    fs.readFile(filePath, function (err, data) {
      if (err) {
        res.writeHead(404);
        res.write("File not found");
      } else {
        res.write(data);
      }
      return res.end();
    });
    serve(req, res, done);
  }
});


const io = SQuery.io(server);
io.on("connection", (socket: any) => {

});

const hostname = "127.0.0.1";
const port = 3501;
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});




