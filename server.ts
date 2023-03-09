
import finalhandler from "finalhandler";
import fs from "fs";
import http from "http";
import mime from "mime-types";
import path from "path";

import serveStatic from "serve-static";
import Log from "sublymus_logger";
import AuthController from "./App/Controllers/AuthController";
import ManagerAccountModel from "./App/Models/ManagerAccountModel";
import ManagerModel from "./App/Models/ManagerModel";
import { AloFiles } from "./lib/squery/Initialize";
import { SQuery } from "./lib/squery/SQuery";

//public // css - js - html     auth



//resources // css - js - html  auth 


//dir  // diskUrl               auth

/**
 *  authentifier 
 
   DB  File 
        - [url]

un user peut cree un ficher...       //
un user peut recuperer le fichier    //

mettre son ficher en private
mettre son fichier en shared [liste user abiliter]
mettre son ficher en public 

FileGroup{
  members:[{
    type : id
  }]
}

File{

}

-- priver
//disk /tamp/1678032034539_6404bca0e61b9207308587d#23456789876543456.png /// key
//disk /tamp/1678032034539_6404bca0e61b9207308587d.png
//disk /tamp/1678032034539_6404bca0e61b9207308587d-34567890987654456789.png // groupe
//http://127.0.0.1:3500/tamp/1678032034539_6404bca0e61b9207308587d.png
 */

let cookieBrut: string;
const serve = serveStatic(__dirname + "/Public");
const server = http.createServer(function (req, res) {
  if (req.url === "/") {
    fs.readFile(__dirname + "/Public/views/test.html", function (err, data) {
      const cookieHeader = req.headers.cookie;
      res.writeHead(200, { "Content-Type": "index.html" });
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
  socket.on("signup", async (data, cb) => {
    const authCtrl = new AuthController();
    const res = await authCtrl.signup({
      data,
      __key: "",
      __permission: "user",
      action: "create",
      modelPath: data.__modelPath,
      socket,
    });
    Log('resultat', res)
    if (res.error) {
      cb(res);
    } else {
      cb({ ...res.response.response })
    }
  });

  socket.on("upload", (data, cb) => {
    Log("reseved", data[0].fileName);
    AloFiles.files = data;
    cb(data.length);
  });
  socket.on("sendCode", async (data, cb) => {
    // let code = genereCode();
    // Aes.encrypt(code, "password").then(async (hash) => {
    //   cb(hash);
    // });
  });

  socket.on("sendEmail", async (data, cb) => {
    // if (data.code) {
    //   Aes.decrypt(data.code, "password").then((plainCode) => {
    //     Log("keyCode", plainCode)
    //     sendEmail(data.userEmail, data.userName, plainCode);
    //   });
    // }
  });









  SQuery.ctrl('draw', ['toCartoon'])






























  socket.on("verifyCode", async (data, cb) => {
    let manageraccount = await ManagerAccountModel.findOne({
      email: data.email,
    });
    cb(data.codeuser === await manageraccount.decryptCode());
  });

  socket.on("validcompt", async (data, cb) => {
    console.log({ data });
    await ManagerModel.updateOne(
      {
        _id: data.id,
      },
      { $unset: { expires_at: "" } }
    );

    await ManagerAccountModel.updateOne(
      {
        email: data.email,
      },
      { $unset: { expires_at: "", codes: "" } }
    );
  });
});

const hostname = "127.0.0.1";
const port = 3501;
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});




