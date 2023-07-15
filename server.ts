import express from "express";
import path from "path";
import cookieSession from 'cookie-session'
import cors from 'cors'
import { Socket } from "socket.io";
import './squeryconfig'
import { SQuery } from "./lib/squery/SQuery";
import Log from "sublymus_logger";
import cookieParser from 'cookie-parser';
import { Config } from "./lib/squery/Config";

const start = ['static', 'asset-manifest', 'favicon', 'logo', 'manifest', 'robots', 'index']

const app = express();
const server = app.listen(Config.conf.PORT, () => {
  console.log('Server running at http://localhost:' + Config.conf.PORT);
});

app.use(cookieParser());
app.use(cors({
  origin: '*'
}));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Public/app/index.html"));
});
app.get("/test", (req, res) => {
  res.sendFile(path.join(__dirname, "Public/views/test.html"));
});

app.get("*", async (req, res) => {
  if (req.path.startsWith('/tamp') || req.path.startsWith('/temp')) {
    try {
      const urlData = await SQuery.files.accessValidator(req.url, req.cookies)
      if (!urlData) return res.status(404).send('File Not Found')
      return res.sendFile(path.join(__dirname, urlData.realPath));
    } catch (error) {
      Log('FILE_ACCESS_ERROR', error)
      return res.status(404).send('File Not Found')
    }
  }
  const app = start.find(path => req.path.startsWith('/' + path))
  const filePath = path.join(__dirname, `Public/${app ? 'app' : 'views'}`, req.path);
  res.sendFile(filePath);
});

const io = SQuery.io(server);
SQuery.emiter.when('ert', (val) => {
  console.log(val);

})

io?.on("connection", (socket: Socket) => {
  SQuery.emiter.emit('ert', socket.id)
  console.log("user is connect");
  socket.on("disconnect", () => {
    console.log("user is disconnect");
  });
});
