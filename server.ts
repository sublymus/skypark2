import express from "express";
import path from "path";
import cors from 'cors'
import { Server, Socket } from "socket.io";
import Log from "sublymus_logger";
import cookieParser from 'cookie-parser';
import { SQuery } from "./lib/squery/SQuery";
import { Controllers } from "./App/Tools/Controllers";
import { ModelControllers } from "./App/Tools/ModelControllers";
declare module "./lib/squery/SQuery_config" {
  export interface ConfigInterface {
    PORT:number,
    tempDir?:string
    tempDuration?:number,
  }
}

SQuery.Config ={
    PORT:3500,
    tempDir:'/temp',
    tempDuration:24*60*60*1000,
    URL_KEY:'Log("<{-_-}>","\\(^_^)/")',
    TOKEN_KEY:'Log("(-^-)","(- _-)")',
    rootDir:__dirname,
    execDir:['/Start'],
}

const start = ['static', 'asset-manifest', 'favicon', 'logo', 'manifest', 'robots', 'index']

const app = express();
const httpServer = app.listen( SQuery.Config.PORT, () => {
  console.log('Server running at http://localhost:' + SQuery.Config.PORT);
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
  if (req.path.startsWith('/fs') ) {
    try {
      const urlData = await SQuery.Files.accessValidator(req.url, req.cookies)
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

const io = SQuery.init(new Server(httpServer, {
  maxHttpBufferSize: 1e10,
  cors: SQuery.Config.IO_CORS,
  cookie: {
    name: "io",
    path: "/",
    httpOnly: false,
    sameSite: "lax",
  },
}), Controllers,ModelControllers);
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

Log.define('des**',{
  visible:true,
  style:['green','white','underscore'],
  count:true,
  folder:true,
});

Log.define('collect',{
  visible:true,
  style:['crimson','','blink']
});
Log.print('collect',{
})
